import { describe, it, expect } from 'vitest';
import { validateSubjectMark, validateAllMarks } from './marks';

describe('validateSubjectMark', () => {
  it('accepts integer marks between 0 and 100', () => {
    expect(validateSubjectMark('maths', '0')).toEqual({ success: true, value: 0 });
    expect(validateSubjectMark('science', '100')).toEqual({ success: true, value: 100 });
    expect(validateSubjectMark('english', '75')).toEqual({ success: true, value: 75 });
  });

  it('accepts decimal marks', () => {
    const result = validateSubjectMark('maths', '69.6');
    expect(result).toEqual({ success: true, value: 69.6 });
  });

  it('trims whitespace', () => {
    const result = validateSubjectMark('social_studies', '   52.4   ');
    expect(result).toEqual({ success: true, value: 52.4 });
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateSubjectMark('maths', null)).toEqual({
      success: false,
      errors: [
        {
          field: 'maths',
          code: 'MISSING_REQUIRED',
          message: 'maths is required',
        },
      ],
    });

    expect(validateSubjectMark('science', '')).toEqual({
      success: false,
      errors: [
        {
          field: 'science',
          code: 'MISSING_REQUIRED',
          message: 'science is required',
        },
      ],
    });
  });

  it('rejects non-numeric values with INVALID_FORMAT', () => {
    const nonNumeric = ['absent', 'N/A', 'fifty', '12..3'];
    for (const val of nonNumeric) {
      const result = validateSubjectMark('english', val);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });

  it('rejects marks less than 0 or greater than 100 with OUT_OF_RANGE', () => {
    const outOfRange = ['-5', '105', '100.5', '1e3', '-0.1'];
    for (const val of outOfRange) {
      const result = validateSubjectMark('maths', val);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    }
  });
});

describe('validateAllMarks', () => {
  it('validates a complete set of marks and returns Marks object', () => {
    const input = {
      maths: '80',
      science: '75.5',
      english: '90',
      social_studies: '85',
      second_language: '88',
    };

    const result = validateAllMarks(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        maths: 80,
        science: 75.5,
        english: 90,
        social_studies: 85,
        second_language: 88,
      });
    }
  });

  it('collects all errors across multiple invalid subject fields', () => {
    const input = {
      maths: '-5', // OUT_OF_RANGE
      science: '', // MISSING_REQUIRED
      english: 'abc', // INVALID_FORMAT
      social_studies: '105', // OUT_OF_RANGE
      second_language: '50', // valid
    };

    const result = validateAllMarks(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveLength(4);
      expect(result.errors.map((e) => e.field)).toEqual([
        'maths',
        'science',
        'english',
        'social_studies',
      ]);
    }
  });
});
