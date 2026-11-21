import { describe, it, expect } from 'vitest';
import { validateGradeLevel, validateSection } from './gradeAndSection';

describe('validateGradeLevel', () => {
  it('accepts valid grade levels from 1 to 12', () => {
    for (let i = 1; i <= 12; i++) {
      const result = validateGradeLevel(String(i));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(i);
      }
    }
  });

  it('accepts leading zeros (e.g., "09", "01")', () => {
    const res9 = validateGradeLevel('09');
    expect(res9.success).toBe(true);
    if (res9.success) expect(res9.value).toBe(9);

    const res1 = validateGradeLevel('01');
    expect(res1.success).toBe(true);
    if (res1.success) expect(res1.value).toBe(1);
  });

  it('trims whitespace', () => {
    const result = validateGradeLevel('   10   ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe(10);
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateGradeLevel(null)).toEqual({
      success: false,
      errors: [
        {
          field: 'grade_level',
          code: 'MISSING_REQUIRED',
          message: 'Grade level is required',
        },
      ],
    });

    expect(validateGradeLevel('')).toEqual({
      success: false,
      errors: [
        {
          field: 'grade_level',
          code: 'MISSING_REQUIRED',
          message: 'Grade level is required',
        },
      ],
    });
  });

  it('rejects roman numerals (e.g. "IX") and non-integer strings with INVALID_FORMAT', () => {
    const invalidFormats = ['IX', 'Grade 9', '9.5', '12th', 'abc', '-5'];
    for (const val of invalidFormats) {
      const result = validateGradeLevel(val);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });

  it('rejects whole numbers outside 1-12 with OUT_OF_RANGE', () => {
    const outOfRange = ['0', '13', '100'];
    for (const val of outOfRange) {
      const result = validateGradeLevel(val);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('OUT_OF_RANGE');
      }
    }
  });
});

describe('validateSection', () => {
  it('accepts uppercase and lowercase letters A to F and returns uppercase', () => {
    const valid = ['a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'];
    for (const letter of valid) {
      const result = validateSection(letter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(letter.toUpperCase());
      }
    }
  });

  it('trims whitespace', () => {
    const result = validateSection('   b   ');
    expect(result.success).toBe(true);
    if (result.success) expect(result.value).toBe('B');
  });

  it('rejects missing or empty values with MISSING_REQUIRED', () => {
    expect(validateSection(null)).toEqual({
      success: false,
      errors: [
        {
          field: 'section',
          code: 'MISSING_REQUIRED',
          message: 'Section is required',
        },
      ],
    });

    expect(validateSection('')).toEqual({
      success: false,
      errors: [
        {
          field: 'section',
          code: 'MISSING_REQUIRED',
          message: 'Section is required',
        },
      ],
    });
  });

  it('rejects letters outside A-F (e.g. "Z" from students_small.csv) with INVALID_FORMAT', () => {
    const invalid = ['Z', 'G', 'H', '1', 'AB', 'Section A'];
    for (const val of invalid) {
      const result = validateSection(val);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].code).toBe('INVALID_FORMAT');
      }
    }
  });
});
