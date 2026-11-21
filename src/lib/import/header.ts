import { REQUIRED_COLUMNS, HeaderAnalysis } from './types';

/**
 * Normalizes a column name by removing UTF-8 BOM, trimming whitespace, and converting to lowercase.
 */
export function normalizeColumnName(name: string): string {
  return name.replace(/^\ufeff/, '').trim().toLowerCase();
}

/**
 * Analyzes and validates CSV header columns.
 * - Header must contain all required columns.
 * - Column order and letter case do not matter.
 * - Surrounding spaces are ignored.
 * - Extra columns are ignored.
 */
export function analyzeHeader(rawColumns: string[]): HeaderAnalysis {
  if (!rawColumns || rawColumns.length === 0) {
    return {
      isValid: false,
      rawColumns: [],
      normalizedColumns: [],
      columnIndexMap: new Map(),
      missingColumns: [...REQUIRED_COLUMNS],
      error: 'Header row is missing or empty',
    };
  }

  const normalizedColumns = rawColumns.map(normalizeColumnName);
  const columnIndexMap = new Map<string, number>();

  normalizedColumns.forEach((col, index) => {
    if (col && !columnIndexMap.has(col)) {
      columnIndexMap.set(col, index);
    }
  });

  const missingColumns: string[] = [];
  for (const required of REQUIRED_COLUMNS) {
    if (!columnIndexMap.has(required)) {
      missingColumns.push(required);
    }
  }

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      rawColumns,
      normalizedColumns,
      columnIndexMap,
      missingColumns,
      error: `Missing required column(s): ${missingColumns.join(', ')}`,
    };
  }

  return {
    isValid: true,
    rawColumns,
    normalizedColumns,
    columnIndexMap,
    missingColumns: [],
  };
}
