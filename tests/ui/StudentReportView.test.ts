import { describe, it, expect } from 'vitest';
import { getInitials, getSubjectScoreBarColor } from '@/components/StudentReportView';

describe('StudentReportView helpers', () => {
  it('correctly generates 2-letter initials for single and multi-word names', () => {
    expect(getInitials('Aarav Sharma')).toBe('AS');
    expect(getInitials('John')).toBe('JO');
    expect(getInitials('Mary Jane Watson')).toBe('MW');
    expect(getInitials('')).toBe('ST');
    expect(getInitials('  Aarav   Singh  ')).toBe('AS');
  });

  it('assigns color classes based on mark thresholds', () => {
    expect(getSubjectScoreBarColor(85)).toBe('bg-emerald-500');
    expect(getSubjectScoreBarColor(60)).toBe('bg-indigo-600');
    expect(getSubjectScoreBarColor(40)).toBe('bg-amber-500');
    expect(getSubjectScoreBarColor(20)).toBe('bg-rose-500');
  });
});
