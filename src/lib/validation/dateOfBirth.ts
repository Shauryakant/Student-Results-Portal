import { ValidationResult } from './types';

const YYYY_MM_DD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DD_MM_YYYY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Checks whether a given year, month (1-12), and day (1-31) form a real calendar date.
 * Correctly accounts for month lengths and leap years.
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  // Date.UTC(year, month, 0) gives the last day of the given month
  const maxDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= maxDays;
}

/**
 * Calculates full completed chronological years between dob and today.
 */
export function calculateAge(dobYear: number, dobMonth: number, dobDay: number, today: Date): number {
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1; // 1-based
  const currentDay = today.getUTCDate();

  let age = currentYear - dobYear;
  if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDay < dobDay)) {
    age--;
  }
  return age;
}

/**
 * Validates date_of_birth.
 * - Required
 * - Format must be YYYY-MM-DD or DD/MM/YYYY
 * - Must be a real calendar date (checks leap years, month days)
 * - Age today must be between 5 and 25 (inclusive)
 * - `today` is injectable for deterministic testing
 */
export function validateDateOfBirth(
  input: unknown,
  today: Date = new Date(),
): ValidationResult<Date> {
  if (input === null || input === undefined) {
    return {
      success: false,
      errors: [
        {
          field: 'date_of_birth',
          code: 'MISSING_REQUIRED',
          message: 'Date of birth is required',
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
          field: 'date_of_birth',
          code: 'MISSING_REQUIRED',
          message: 'Date of birth is required',
        },
      ],
    };
  }

  let year: number;
  let month: number;
  let day: number;

  const yyyyMatch = raw.match(YYYY_MM_DD_REGEX);
  if (yyyyMatch) {
    year = parseInt(yyyyMatch[1], 10);
    month = parseInt(yyyyMatch[2], 10);
    day = parseInt(yyyyMatch[3], 10);
  } else {
    const ddmmyyyyMatch = raw.match(DD_MM_YYYY_REGEX);
    if (ddmmyyyyMatch) {
      day = parseInt(ddmmyyyyMatch[1], 10);
      month = parseInt(ddmmyyyyMatch[2], 10);
      year = parseInt(ddmmyyyyMatch[3], 10);
    } else {
      return {
        success: false,
        errors: [
          {
            field: 'date_of_birth',
            code: 'INVALID_FORMAT',
            message: 'Date of birth must be in YYYY-MM-DD or DD/MM/YYYY format',
          },
        ],
      };
    }
  }

  if (!isValidCalendarDate(year, month, day)) {
    return {
      success: false,
      errors: [
        {
          field: 'date_of_birth',
          code: 'INVALID_FORMAT',
          message: 'Date of birth is not a valid calendar date',
        },
      ],
    };
  }

  const age = calculateAge(year, month, day, today);

  if (age < 5 || age > 25) {
    return {
      success: false,
      errors: [
        {
          field: 'date_of_birth',
          code: 'OUT_OF_RANGE',
          message: `Student age (${age}) is outside the allowed range of 5 to 25 years`,
        },
      ],
    };
  }

  // Return standard UTC Date object representing this calendar date
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return {
    success: true,
    value: parsedDate,
  };
}
