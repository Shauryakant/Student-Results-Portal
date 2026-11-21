import { parseCsv } from './csvParser';
import { DuplicateTracker } from './duplicateTracker';
import { validateRow } from '../validation/rowValidator';
import { ProblemReport, ValidatedStudentRow } from '../validation/types';

export interface ProcessedImportData {
  rowsRead: number;
  importedCount: number;
  rejectedCount: number;
  validStudents: { row: number; student: ValidatedStudentRow }[];
  problems: ProblemReport[];
  status: 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

/**
 * Orchestrates the parsing and validation pipeline for an uploaded CSV.
 * - Enforces header rules
 * - Accurately counts non-blank, non-empty data rows
 * - Handles WRONG_FIELD_COUNT
 * - Detects in-file case-insensitive duplicate IDs
 * - Gathers all validation problems per row while incrementing rejected count by 1 per bad row
 */
export async function processCsvContent(
  input: string | Buffer,
  today: Date = new Date(),
): Promise<ProcessedImportData> {
  const { headerAnalysis, rows } = await parseCsv(input);

  if (!headerAnalysis.isValid) {
    return {
      rowsRead: 0,
      importedCount: 0,
      rejectedCount: 0,
      validStudents: [],
      problems: [],
      status: 'FAILED',
      errorMessage: headerAnalysis.error || 'Invalid CSV header',
    };
  }

  const expectedColumnCount = headerAnalysis.rawColumns.length;
  const duplicateTracker = new DuplicateTracker();

  let rowsRead = 0;
  let rejectedCount = 0;
  const validStudents: { row: number; student: ValidatedStudentRow }[] = [];
  const problems: ProblemReport[] = [];

  for (const row of rows) {
    rowsRead++;

    // 1. Wrong field count: row rejected as a whole
    if (row.isWrongFieldCount) {
      rejectedCount++;
      problems.push({
        row: row.lineNumber,
        student_id: row.studentIdRaw || '(unknown)',
        field: '(whole row)',
        code: 'WRONG_FIELD_COUNT',
        message: `Expected ${expectedColumnCount} fields, found ${row.rawFields.length}`,
      });
      continue;
    }

    if (!row.rowObject) {
      rejectedCount++;
      problems.push({
        row: row.lineNumber,
        student_id: row.studentIdRaw || '(unknown)',
        field: '(whole row)',
        code: 'INVALID_FORMAT',
        message: 'Unable to parse row data',
      });
      continue;
    }

    const rawId = row.rowObject['student_id']?.trim() || '';

    // 2. In-file duplicate ID check
    if (rawId) {
      const dupCheck = duplicateTracker.checkAndRecord(rawId, row.lineNumber);
      if (dupCheck.isDuplicate) {
        rejectedCount++;
        problems.push({
          row: row.lineNumber,
          student_id: rawId.toUpperCase(),
          field: 'student_id',
          code: 'DUPLICATE_ID',
          message: 'Duplicate of an earlier row (DUPLICATE_ID)',
        });
        continue;
      }
    }

    // 3. Row field validation
    const validationResult = validateRow(row.rowObject, today);

    if (!validationResult.success) {
      rejectedCount++;
      const studentIdDisplay = rawId ? rawId.toUpperCase() : '(blank)';
      for (const err of validationResult.errors) {
        problems.push({
          row: row.lineNumber,
          student_id: studentIdDisplay,
          field: err.field,
          code: err.code,
          message: err.message,
        });
      }
    } else {
      validStudents.push({
        row: row.lineNumber,
        student: validationResult.value,
      });
    }
  }

  return {
    rowsRead,
    importedCount: validStudents.length,
    rejectedCount,
    validStudents,
    problems,
    status: 'COMPLETED',
  };
}
