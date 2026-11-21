import { ProblemReport, ValidatedStudentRow } from '../validation/types';

export const REQUIRED_COLUMNS = [
  'student_id',
  'full_name',
  'email',
  'date_of_birth',
  'grade_level',
  'section',
  'maths',
  'science',
  'english',
  'social_studies',
  'second_language',
] as const;

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

export interface HeaderAnalysis {
  isValid: boolean;
  rawColumns: string[];
  normalizedColumns: string[];
  columnIndexMap: Map<string, number>;
  missingColumns: string[];
  error?: string;
}

export interface ImportSummary {
  importId: string;
  filename: string;
  rowsRead: number;
  imported: number;
  newCount: number;
  updatedCount: number;
  rejected: number;
  problemsCount: number;
  problems: ProblemReport[];
  startedAt: Date;
  finishedAt: Date;
  status: 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

export interface ImportRowRecord {
  lineNumber: number;
  rawRecord: string[];
  parsedObject?: Record<string, string>;
  isValidFieldCount: boolean;
  isEmpty: boolean;
}

export interface ParsedStudentData {
  row: number;
  student: ValidatedStudentRow;
}
