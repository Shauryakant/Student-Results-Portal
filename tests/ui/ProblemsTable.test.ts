import { describe, it, expect } from 'vitest';
import { formatProblemMessage, getProblemBadgeColor } from '@/components/ProblemsTable';
import { ProblemReport } from '@/lib/validation/types';

describe('formatProblemMessage', () => {
  it('appends error code in parentheses if not already in message', () => {
    const prob: ProblemReport = {
      row: 14,
      student_id: 'STU00123',
      field: 'email',
      code: 'INVALID_FORMAT',
      message: 'Not a valid email address',
    };

    expect(formatProblemMessage(prob)).toBe(
      'Not a valid email address (INVALID_FORMAT)',
    );
  });

  it('preserves message if code is already present', () => {
    const prob: ProblemReport = {
      row: 58,
      student_id: 'STU00019',
      field: 'student_id',
      code: 'DUPLICATE_ID',
      message: 'Duplicate of an earlier row (DUPLICATE_ID)',
    };

    expect(formatProblemMessage(prob)).toBe(
      'Duplicate of an earlier row (DUPLICATE_ID)',
    );
  });

  it('assigns specific color classes for error codes', () => {
    expect(getProblemBadgeColor('DUPLICATE_ID')).toContain('amber');
    expect(getProblemBadgeColor('WRONG_FIELD_COUNT')).toContain('rose');
    expect(getProblemBadgeColor('OUT_OF_RANGE')).toContain('orange');
    expect(getProblemBadgeColor('INVALID_FORMAT')).toContain('purple');
    expect(getProblemBadgeColor('MISSING_REQUIRED')).toContain('red');
  });
});
