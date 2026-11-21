import {
  ValidatedStudentRow,
  ValidationError,
  ValidationResult,
  Marks,
} from './types';
import { validateStudentId } from './studentId';
import { validateFullName } from './fullName';
import { validateEmail } from './email';
import { validateDateOfBirth } from './dateOfBirth';
import { validateGradeLevel, validateSection } from './gradeAndSection';
import { validateAllMarks } from './marks';

export interface RowValidationOutput {
  student?: ValidatedStudentRow;
  studentIdRaw?: string;
  errors: ValidationError[];
}

/**
 * Normalizes an object's keys to lowercase trimmed strings for flexible column matching.
 */
export function normalizeRowKeys(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    normalized[key.trim().toLowerCase()] = val;
  }
  return normalized;
}

/**
 * Validates a single row of student data.
 * Checks all fields and collects ALL errors for the row.
 * Computes total and percentage if all fields are valid.
 */
export function validateRow(
  rawRow: Record<string, unknown>,
  today: Date = new Date(),
): ValidationResult<ValidatedStudentRow> & { studentIdRaw?: string } {
  const row = normalizeRowKeys(rawRow);
  const errors: ValidationError[] = [];

  const studentIdResult = validateStudentId(row['student_id']);
  if (!studentIdResult.success) {
    errors.push(...studentIdResult.errors);
  }

  const fullNameResult = validateFullName(row['full_name']);
  if (!fullNameResult.success) {
    errors.push(...fullNameResult.errors);
  }

  const emailResult = validateEmail(row['email']);
  if (!emailResult.success) {
    errors.push(...emailResult.errors);
  }

  const dobResult = validateDateOfBirth(row['date_of_birth'], today);
  if (!dobResult.success) {
    errors.push(...dobResult.errors);
  }

  const gradeResult = validateGradeLevel(row['grade_level']);
  if (!gradeResult.success) {
    errors.push(...gradeResult.errors);
  }

  const sectionResult = validateSection(row['section']);
  if (!sectionResult.success) {
    errors.push(...sectionResult.errors);
  }

  const marksResult = validateAllMarks({
    maths: row['maths'],
    science: row['science'],
    english: row['english'],
    social_studies: row['social_studies'],
    second_language: row['second_language'],
  });
  if (!marksResult.success) {
    errors.push(...marksResult.errors);
  }

  const rawIdString =
    row['student_id'] !== undefined && row['student_id'] !== null
      ? String(row['student_id']).trim()
      : '';

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      studentIdRaw: rawIdString,
    };
  }

  // All fields valid
  const studentId = (studentIdResult as { success: true; value: string }).value;
  const { fullName, nameSearch } = (
    fullNameResult as {
      success: true;
      value: { fullName: string; nameSearch: string };
    }
  ).value;
  const email = (emailResult as { success: true; value: string }).value;
  const dateOfBirth = (dobResult as { success: true; value: Date }).value;
  const gradeLevel = (gradeResult as { success: true; value: number }).value;
  const section = (sectionResult as { success: true; value: string }).value;
  const marks = (marksResult as { success: true; value: Marks }).value;

  const total =
    marks.maths +
    marks.science +
    marks.english +
    marks.social_studies +
    marks.second_language;

  // Round percentage calculation
  const percentage = (total / 500) * 100;

  return {
    success: true,
    studentIdRaw: studentId,
    value: {
      student_id: studentId,
      full_name: fullName,
      name_search: nameSearch,
      email,
      date_of_birth: dateOfBirth,
      grade_level: gradeLevel,
      section,
      marks,
      total,
      percentage,
    },
  };
}
