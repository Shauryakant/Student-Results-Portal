import { ValidationResult } from './types';

const SECTION_REGEX = /^[A-Fa-f]$/;
const WHOLE_NUMBER_REGEX = /^\d+$/;

/**
 * Validates and parses grade_level.
 * - Required
 * - Whole number from 1 to 12
 * - "9" and "09" are fine
 */
export function validateGradeLevel(input: unknown): ValidationResult<number> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'grade_level',
          code: 'MISSING_REQUIRED',
          message: 'Grade level is required',
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
          field: 'grade_level',
          code: 'MISSING_REQUIRED',
          message: 'Grade level is required',
        },
      ],
    };
  }

  if (!WHOLE_NUMBER_REGEX.test(raw)) {
    return {
      success: false,
      errors: [
        {
          field: 'grade_level',
          code: 'INVALID_FORMAT',
          message: 'Grade level must be a whole number between 1 and 12',
        },
      ],
    };
  }

  const grade = parseInt(raw, 10);

  if (grade < 1 || grade > 12) {
    return {
      success: false,
      errors: [
        {
          field: 'grade_level',
          code: 'OUT_OF_RANGE',
          message: 'Grade level must be between 1 and 12',
        },
      ],
    };
  }

  return {
    success: true,
    value: grade,
  };
}

/**
 * Validates and normalizes section.
 * - Required
 * - One letter from A to F, any case
 * - Stored in uppercase
 */
export function validateSection(input: unknown): ValidationResult<string> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'section',
          code: 'MISSING_REQUIRED',
          message: 'Section is required',
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
          field: 'section',
          code: 'MISSING_REQUIRED',
          message: 'Section is required',
        },
      ],
    };
  }

  if (!SECTION_REGEX.test(raw)) {
    return {
      success: false,
      errors: [
        {
          field: 'section',
          code: 'INVALID_FORMAT',
          message: 'Section must be a single letter from A to F',
        },
      ],
    };
  }

  return {
    success: true,
    value: raw.toUpperCase(),
  };
}
