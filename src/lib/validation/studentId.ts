import { ValidationResult } from './types';

const STUDENT_ID_REGEX = /^[A-Za-z0-9-]{3,20}$/;

/**
 * Validates and normalizes student_id.
 * - Required
 * - 3 to 20 characters: letters, digits or hyphen
 * - Surrounding whitespace trimmed
 * - Stored in UPPERCASE
 */
export function validateStudentId(input: unknown): ValidationResult<string> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'MISSING_REQUIRED',
          message: 'Student ID is required',
        },
      ],
    };
  }

  const raw = String(input).trim();

  if (raw === '') {
    return {
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'MISSING_REQUIRED',
          message: 'Student ID is required',
        },
      ],
    };
  }

  if (!STUDENT_ID_REGEX.test(raw)) {
    return {
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'INVALID_FORMAT',
          message: 'Student ID must be between 3 and 20 characters containing only letters, numbers, or hyphens',
        },
      ],
    };
  }

  return {
    success: true,
    value: raw.toUpperCase(),
  };
}
