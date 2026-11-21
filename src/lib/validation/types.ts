export type ErrorCode =
  | 'MISSING_REQUIRED'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'DUPLICATE_ID'
  | 'WRONG_FIELD_COUNT';

export interface ValidationError {
  field: string;
  code: ErrorCode;
  message: string;
}

export interface ValidationSuccess<T> {
  success: true;
  value: T;
}

export interface ValidationFailure {
  success: false;
  errors: ValidationError[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface ProblemReport {
  row: number; // 1-based file line number
  student_id: string;
  field: string;
  code: ErrorCode;
  message: string;
}

export interface Marks {
  maths: number;
  science: number;
  english: number;
  social_studies: number;
  second_language: number;
}

export interface ValidatedStudentRow {
  student_id: string;
  full_name: string;
  name_search: string;
  email: string;
  date_of_birth: Date;
  grade_level: number;
  section: string;
  marks: Marks;
  total: number;
  percentage: number;
}
