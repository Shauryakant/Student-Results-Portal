import { ValidationResult } from './types';

// Supports all Unicode letters (\p{L}), spaces, apostrophes, commas, periods, and hyphens
const VALID_NAME_CHARS_REGEX = /^[\p{L}\s',.\-]+$/u;

export interface FullNameValidated {
  fullName: string;
  nameSearch: string;
}

/**
 * Validates and normalizes full_name.
 * - Required
 * - Trim leading/trailing whitespace
 * - Collapse repeated inner spaces
 * - 2 to 100 characters
 * - Any Unicode letters, apostrophes, commas, hyphens, periods allowed
 */
export function validateFullName(input: unknown): ValidationResult<FullNameValidated> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'MISSING_REQUIRED',
          message: 'Full name is required',
        },
      ],
    };
  }

  // Trim and collapse repeated inner spaces
  const normalized = String(input).trim().replace(/\s+/g, ' ');

  if (normalized === '') {
    return {
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'MISSING_REQUIRED',
          message: 'Full name is required',
        },
      ],
    };
  }

  if (normalized.length < 2 || normalized.length > 100) {
    return {
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'INVALID_FORMAT',
          message: 'Full name must be between 2 and 100 characters',
        },
      ],
    };
  }

  if (!VALID_NAME_CHARS_REGEX.test(normalized)) {
    return {
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'INVALID_FORMAT',
          message: 'Full name contains invalid characters',
        },
      ],
    };
  }

  return {
    success: true,
    value: {
      fullName: normalized,
      nameSearch: normalized.toLowerCase(),
    },
  };
}
