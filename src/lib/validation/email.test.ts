import { describe, it, expect } from 'vitest';
import { validateEmail } from './email';

describe('validateEmail', () => {
  it('accepts valid email addresses and converts to lowercase', () => {
    const result = validateEmail('ADITYA.PAWAR82@EXAMPLE.EDU');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('aditya.pawar82@example.edu');
    }
  });

  it('trims whitespace around the email', () => {
    const result = validateEmail('   siddharth.bose98@example.edu   ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('siddharth.bose98@example.edu');
    }
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateEmail(null)).toEqual({
      success: false,
      errors: [
        {
          field: 'email',
          code: 'MISSING_REQUIRED',
          message: 'Email is required',
        },
      ],
    });

    expect(validateEmail('')).toEqual({
      success: false,
      errors: [
        {
          field: 'email',
          code: 'MISSING_REQUIRED',
          message: 'Email is required',
        },
      ],
    });

    expect(validateEmail('   ')).toEqual({
      success: false,
      errors: [
        {
          field: 'email',
          code: 'MISSING_REQUIRED',
          message: 'Email is required',
        },
      ],
    });
  });

  it('rejects emails without TLD (e.g., sana@example from students_small.csv)', () => {
    const result = validateEmail('sana@example');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    }
  });

  it('rejects emails with invalid characters or missing parts', () => {
    const invalidCases = [
      'plainaddress',
      '@missinguser.com',
      'user@.com',
      'user@com',
      'user space@example.com',
      'user@@example.com',
    ];

    for (const email of invalidCases) {
      const result = validateEmail(email);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });
});
