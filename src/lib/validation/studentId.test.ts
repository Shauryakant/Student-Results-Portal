import { describe, it, expect } from 'vitest';
import { validateStudentId } from './studentId';

describe('validateStudentId', () => {
  it('accepts valid alphanumeric student IDs and converts to uppercase', () => {
    const result = validateStudentId('stu00001');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('STU00001');
    }
  });

  it('accepts IDs with hyphens', () => {
    const result = validateStudentId('STU-2024-01');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('STU-2024-01');
    }
  });

  it('trims leading and trailing whitespace', () => {
    const result = validateStudentId('   STU00012   ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('STU00012');
    }
  });

  it('accepts boundary lengths: 3 chars and 20 chars', () => {
    const minResult = validateStudentId('A-1');
    expect(minResult.success).toBe(true);
    if (minResult.success) {
      expect(minResult.value).toBe('A-1');
    }

    const maxResult = validateStudentId('12345678901234567890');
    expect(maxResult.success).toBe(true);
    if (maxResult.success) {
      expect(maxResult.value).toBe('12345678901234567890');
    }
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateStudentId(null)).toEqual({
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'MISSING_REQUIRED',
          message: 'Student ID is required',
        },
      ],
    });

    expect(validateStudentId('')).toEqual({
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'MISSING_REQUIRED',
          message: 'Student ID is required',
        },
      ],
    });

    expect(validateStudentId('   ')).toEqual({
      success: false,
      errors: [
        {
          field: 'student_id',
          code: 'MISSING_REQUIRED',
          message: 'Student ID is required',
        },
      ],
    });
  });

  it('rejects IDs shorter than 3 chars with INVALID_FORMAT', () => {
    const result = validateStudentId('AB');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    }
  });

  it('rejects IDs longer than 20 chars with INVALID_FORMAT', () => {
    const result = validateStudentId('123456789012345678901');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
    }
  });

  it('rejects IDs with forbidden characters (spaces, underscores, symbols) with INVALID_FORMAT', () => {
    const cases = ['STU 001', 'STU_001', 'STU#001', 'STU.001', 'STU@001'];
    for (const id of cases) {
      const result = validateStudentId(id);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });
});
