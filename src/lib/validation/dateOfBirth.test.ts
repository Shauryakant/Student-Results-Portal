import { describe, it, expect } from 'vitest';
import { validateDateOfBirth, isValidCalendarDate, calculateAge } from './dateOfBirth';

describe('isValidCalendarDate', () => {
  it('validates standard months correctly', () => {
    expect(isValidCalendarDate(2020, 1, 31)).toBe(true);
    expect(isValidCalendarDate(2020, 4, 30)).toBe(true);
    expect(isValidCalendarDate(2020, 4, 31)).toBe(false); // April has 30 days
  });

  it('validates leap years and non-leap years for February', () => {
    expect(isValidCalendarDate(2024, 2, 29)).toBe(true); // 2024 is leap year
    expect(isValidCalendarDate(2020, 2, 29)).toBe(true); // 2020 is leap year
    expect(isValidCalendarDate(2000, 2, 29)).toBe(true); // 2000 is leap year (divisible by 400)
    expect(isValidCalendarDate(2023, 2, 29)).toBe(false); // 2023 is not leap year
    expect(isValidCalendarDate(2100, 2, 29)).toBe(false); // 2100 is not leap year (divisible by 100, not 400)
    expect(isValidCalendarDate(2024, 2, 30)).toBe(false);
  });

  it('rejects invalid month numbers', () => {
    expect(isValidCalendarDate(2020, 0, 15)).toBe(false);
    expect(isValidCalendarDate(2020, 13, 15)).toBe(false);
  });
});

describe('calculateAge', () => {
  const reference = new Date(Date.UTC(2024, 5, 15)); // 15 June 2024

  it('calculates age correctly before and on birthday', () => {
    expect(calculateAge(2014, 6, 15, reference)).toBe(10); // Exact 10th birthday
    expect(calculateAge(2014, 6, 16, reference)).toBe(9); // Birthday is tomorrow
    expect(calculateAge(2014, 6, 14, reference)).toBe(10); // Birthday was yesterday
    expect(calculateAge(2014, 7, 1, reference)).toBe(9); // Birthday next month
    expect(calculateAge(2014, 5, 1, reference)).toBe(10); // Birthday last month
  });
});

describe('validateDateOfBirth', () => {
  const fixedToday = new Date(Date.UTC(2024, 10, 15)); // 15 Nov 2024

  it('accepts YYYY-MM-DD format', () => {
    const result = validateDateOfBirth('2014-03-28', fixedToday);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.toISOString()).toBe('2014-03-28T00:00:00.000Z');
    }
  });

  it('accepts DD/MM/YYYY format', () => {
    const result = validateDateOfBirth('27/12/2008', fixedToday);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.toISOString()).toBe('2008-12-27T00:00:00.000Z');
    }
  });

  it('trims whitespace', () => {
    const result = validateDateOfBirth('   2013-05-10   ', fixedToday);
    expect(result.success).toBe(true);
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateDateOfBirth(null, fixedToday)).toEqual({
      success: false,
      errors: [
        {
          field: 'date_of_birth',
          code: 'MISSING_REQUIRED',
          message: 'Date of birth is required',
        },
      ],
    });

    expect(validateDateOfBirth('', fixedToday)).toEqual({
      success: false,
      errors: [
        {
          field: 'date_of_birth',
          code: 'MISSING_REQUIRED',
          message: 'Date of birth is required',
        },
      ],
    });
  });

  it('rejects invalid date formats with INVALID_FORMAT', () => {
    const invalidFormats = [
      'tomorrow',
      '14.03.2011',
      '11-30-2010',
      '2014/05/10',
      '2014-5-10',
      'rohan.kaur85@example.edu',
    ];

    for (const val of invalidFormats) {
      const result = validateDateOfBirth(val, fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });

  it('rejects non-existent calendar dates with INVALID_FORMAT', () => {
    const impossibleDates = [
      '2023-02-29', // Not a leap year
      '31/04/2015', // April has 30 days
      '2015-13-01', // Month 13
      '00/05/2015', // Day 0
      '32/01/2015', // Day 32
    ];

    for (const val of impossibleDates) {
      const result = validateDateOfBirth(val, fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });

  describe('age boundaries (5 to 25 inclusive)', () => {
    it('accepts exact 5th birthday (age 5)', () => {
      // fixedToday is 2024-11-15. Born 2019-11-15 -> exactly 5
      const result = validateDateOfBirth('2019-11-15', fixedToday);
      expect(result.success).toBe(true);
    });

    it('rejects 1 day before 5th birthday (age 4)', () => {
      // Born 2019-11-16 -> 4 years, 364 days
      const result = validateDateOfBirth('2019-11-16', fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    });

    it('accepts exact 25th birthday (age 25)', () => {
      // Born 1999-11-15 -> exactly 25
      const result = validateDateOfBirth('1999-11-15', fixedToday);
      expect(result.success).toBe(true);
    });

    it('accepts 1 day before 26th birthday (still 25 years old)', () => {
      // Born 1998-11-16 -> 25 years, 364 days
      const result = validateDateOfBirth('1998-11-16', fixedToday);
      expect(result.success).toBe(true);
    });

    it('rejects exact 26th birthday (age 26)', () => {
      // Born 1998-11-15 -> exactly 26
      const result = validateDateOfBirth('1998-11-15', fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    });

    it('rejects dates in 1970 (too old)', () => {
      const result = validateDateOfBirth('1970-01-01', fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    });

    it('rejects dates in the future (e.g. 2031)', () => {
      const result = validateDateOfBirth('2031-05-01', fixedToday);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    });
  });
});
