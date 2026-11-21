import { ValidationResult } from './types';

// Standard HTML5 / RFC 5322 email regex requiring a valid domain with TLD
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates and normalizes email.
 * - Required
 * - Must be valid email address with domain and TLD
 * - Surrounding whitespace trimmed
 * - Stored in lowercase
 */
export function validateEmail(input: unknown): ValidationResult<string> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'email',
          code: 'MISSING_REQUIRED',
          message: 'Email is required',
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
          field: 'email',
          code: 'MISSING_REQUIRED',
          message: 'Email is required',
        },
      ],
    };
  }

  if (!EMAIL_REGEX.test(raw)) {
    return {
      success: false,
      errors: [
        {
          field: 'email',
          code: 'INVALID_FORMAT',
          message: 'Email must be a valid email address',
        },
      ],
    };
  }

  return {
    success: true,
    value: raw.toLowerCase(),
  };
}
