import { parse, Parser } from 'csv-parse';
import { Readable } from 'stream';
import { analyzeHeader } from './header';
import { HeaderAnalysis } from './types';

export interface ParsedCsvRow {
  lineNumber: number;
  rawFields: string[];
  isHeader: boolean;
  isSkipped: boolean; // blank or all-empty row
  isWrongFieldCount: boolean;
  rowObject?: Record<string, string>;
  studentIdRaw?: string;
}

export interface CsvParseResult {
  headerAnalysis: HeaderAnalysis;
  rows: ParsedCsvRow[];
}

/**
 * Checks whether all fields in a row are completely empty.
 */
export function isAllEmptyRow(fields: string[]): boolean {
  if (fields.length === 0) return true;
  if (fields.length === 1 && fields[0].trim() === '') return true;
  return fields.every((field) => field.trim() === '');
}

/**
 * Parses a CSV stream or buffer using `csv-parse`.
 * - bom: true (handles byte order mark)
 * - relax_column_count: true (prevents parser crash on bad lines, allowing us to report WRONG_FIELD_COUNT)
 * - info: true (uses info.lines for exact 1-based file line numbers)
 * - Skips blank lines and all-empty rows without incrementing data row counts
 */
export async function parseCsv(
  input: string | Buffer | Readable,
): Promise<CsvParseResult> {
  const stream: Readable =
    typeof input === 'string' || Buffer.isBuffer(input)
      ? Readable.from(input)
      : input;

  const parser: Parser = stream.pipe(
    parse({
      bom: true,
      relax_column_count: true,
      skip_empty_lines: false, // We inspect every line to keep info.lines 100% accurate
      info: true,
      trim: false,
    }),
  );

  let headerAnalysis: HeaderAnalysis | null = null;
  let expectedColumnCount = 0;
  const rows: ParsedCsvRow[] = [];

  for await (const chunk of parser) {
    // chunk is { record: string[], info: { lines: number, records: number, ... } }
    const record: string[] = chunk.record;
    const lineNumber: number = chunk.info.lines;

    // First non-blank line is the header
    if (!headerAnalysis) {
      if (isAllEmptyRow(record)) {
        // Blank line before header: skipped, but still advances line number
        continue;
      }

      headerAnalysis = analyzeHeader(record);
      expectedColumnCount = record.length;
      continue;
    }

    // Data rows
    if (isAllEmptyRow(record)) {
      // Blank lines and all-empty rows are skipped, not counted, not errors
      continue;
    }

    const isWrongFieldCount = record.length !== expectedColumnCount;
    let rowObject: Record<string, string> | undefined;
    let studentIdRaw: string | undefined;

    if (!isWrongFieldCount && headerAnalysis.isValid) {
      rowObject = {};
      headerAnalysis.columnIndexMap.forEach((colIndex, colName) => {
        if (colIndex < record.length) {
          rowObject![colName] = record[colIndex];
        }
      });
      studentIdRaw = rowObject['student_id']?.trim();
    } else {
      // Even if wrong field count, if index 0 looks like an ID, extract for reporting
      if (record.length > 0 && record[0]) {
        studentIdRaw = record[0].trim();
      }
    }

    rows.push({
      lineNumber,
      rawFields: record,
      isHeader: false,
      isSkipped: false,
      isWrongFieldCount,
      rowObject,
      studentIdRaw,
    });
  }

  if (!headerAnalysis) {
    headerAnalysis = analyzeHeader([]);
  }

  return {
    headerAnalysis,
    rows,
  };
}
