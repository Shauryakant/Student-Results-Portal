import { describe, it, expect } from 'vitest';
import { generatePageNumbers } from '@/components/Pagination';

describe('generatePageNumbers', () => {
  it('returns all numbers when total pages <= 7', () => {
    expect(generatePageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows leading pages and trailing ellipsis when near start', () => {
    expect(generatePageNumbers(2, 20)).toEqual([1, 2, 3, 4, 5, '...', 20]);
    expect(generatePageNumbers(4, 20)).toEqual([1, 2, 3, 4, 5, '...', 20]);
  });

  it('shows trailing pages and leading ellipsis when near end', () => {
    expect(generatePageNumbers(18, 20)).toEqual([1, '...', 16, 17, 18, 19, 20]);
    expect(generatePageNumbers(20, 20)).toEqual([1, '...', 16, 17, 18, 19, 20]);
  });

  it('shows both ellipses when in the middle', () => {
    expect(generatePageNumbers(10, 20)).toEqual([1, '...', 9, 10, 11, '...', 20]);
  });
});
