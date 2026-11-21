import { describe, it, expect } from 'vitest';
import { getInitials } from '@/components/StudentReportView';

describe('StudentReportView helpers', () => {
  it('correctly generates 2-letter initials for single and multi-word names', () => {
    expect(getInitials('Aarav Sharma')).toBe('AS');
    expect(getInitials('John')).toBe('JO');
    expect(getInitials('Mary Jane Watson')).toBe('MW');
    expect(getInitials('')).toBe('ST');
    expect(getInitials('  Aarav   Singh  ')).toBe('AS');
  });
});
