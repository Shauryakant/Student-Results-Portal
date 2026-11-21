import { describe, it, expect } from 'vitest';
import { validateFullName } from './fullName';

describe('validateFullName', () => {
  it('accepts standard full names and trims/normalizes spaces', () => {
    const result = validateFullName('   Siddharth   Bose   ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.fullName).toBe('Siddharth Bose');
      expect(result.value.nameSearch).toBe('siddharth bose');
    }
  });

  it('accepts Unicode characters (e.g., German umlauts, accents, non-Latin scripts)', () => {
    const result = validateFullName('Müller Patel');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.fullName).toBe('Müller Patel');
      expect(result.value.nameSearch).toBe('müller patel');
    }
  });

  it('accepts apostrophes, commas, periods, and hyphens', () => {
    const cases = [
      { input: "Patel, Sahil", expected: "Patel, Sahil" },
      { input: "Mary-Jane O'Connor", expected: "Mary-Jane O'Connor" },
      { input: "Dr. J. R. Smith", expected: "Dr. J. R. Smith" },
    ];

    for (const { input, expected } of cases) {
      const result = validateFullName(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.fullName).toBe(expected);
      }
    }
  });

  it('accepts boundary lengths: 2 chars and 100 chars', () => {
    const minResult = validateFullName('Al');
    expect(minResult.success).toBe(true);

    const maxResult = validateFullName('A'.repeat(100));
    expect(maxResult.success).toBe(true);
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateFullName(null)).toEqual({
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'MISSING_REQUIRED',
          message: 'Full name is required',
        },
      ],
    });

    expect(validateFullName('')).toEqual({
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'MISSING_REQUIRED',
          message: 'Full name is required',
        },
      ],
    });

    expect(validateFullName('   \t\n  ')).toEqual({
      success: false,
      errors: [
        {
          field: 'full_name',
          code: 'MISSING_REQUIRED',
          message: 'Full name is required',
        },
      ],
    });
  });

  it('rejects names shorter than 2 characters with INVALID_FORMAT', () => {
    const result = validateFullName('A');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    }
  });

  it('rejects names longer than 100 characters with INVALID_FORMAT', () => {
    const result = validateFullName('A'.repeat(101));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    }
  });

  it('rejects names containing digits or disallowed special symbols with INVALID_FORMAT', () => {
    const invalidCases = ['John123', 'Aarav@Singh', 'Rohan #1', 'Sneha!'];
    for (const name of invalidCases) {
      const result = validateFullName(name);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });
});
