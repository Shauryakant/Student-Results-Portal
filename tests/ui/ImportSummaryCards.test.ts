import { describe, it, expect } from 'vitest';
import { formatNumber } from '@/components/ImportSummaryCards';

describe('formatNumber', () => {
  it('formats thousands with commas', () => {
    expect(formatNumber(5000)).toBe('5,000');
    expect(formatNumber(4685)).toBe('4,685');
    expect(formatNumber(315)).toBe('315');
    expect(formatNumber(0)).toBe('0');
  });
});
