import { ValidationResult, ValidationError, Marks } from './types';

export const SUBJECTS = [
  'maths',
  'science',
  'english',
  'social_studies',
  'second_language',
] as const;

export type SubjectName = (typeof SUBJECTS)[number];

// Matches numeric strings like "0", "100", "45.5", "0.75", with optional leading minus sign for range checking
const NUMERIC_REGEX = /^-?\d+(\.\d+)?$/;

/**
 * Validates a single subject mark.
 * - Required
 * - Decimals allowed
 * - Range 0 to 100
 */
export function validateSubjectMark(
  subject: SubjectName,
  input: unknown,
): ValidationResult<number> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: subject,
          code: 'MISSING_REQUIRED',
          message: `${subject} is required`,
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
          field: subject,
          code: 'MISSING_REQUIRED',
          message: `${subject} is required`,
        },
      ],
    };
  }

  // Check if it's a valid numeric format
  // Note: scientific notation like "1e3" or strings like "NaN" or "Infinity" should be handled
  const num = Number(raw);
  if (!NUMERIC_REGEX.test(raw) && isNaN(num)) {
    return {
      success: false,
      errors: [
        {
          field: subject,
          code: 'INVALID_FORMAT',
          message: `${subject} must be a valid number`,
        },
      ],
    };
  }

  if (isNaN(num)) {
    return {
      success: false,
      errors: [
        {
          field: subject,
          code: 'INVALID_FORMAT',
          message: `${subject} must be a valid number`,
        },
      ],
    };
  }

  if (num < 0 || num > 100) {
    return {
      success: false,
      errors: [
        {
          field: subject,
          code: 'OUT_OF_RANGE',
          message: `${subject} must be between 0 and 100`,
        },
      ],
    };
  }

  return {
    success: true,
    value: num,
  };
}

/**
 * Validates all 5 subject marks and collects any errors across all of them.
 */
export function validateAllMarks(
  input: Record<string, unknown>,
): ValidationResult<Marks> {
  const errors: ValidationError[] = [];
  const marks: Partial<Marks> = {};

  for (const subject of SUBJECTS) {
    const result = validateSubjectMark(subject, input[subject]);
    if (!result.success) {
      errors.push(...result.errors);
    } else {
      marks[subject] = result.value;
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    value: marks as Marks,
  };
}
