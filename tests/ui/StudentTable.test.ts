import { describe, it, expect } from 'vitest';
import { getGradeBadgeColor } from '@/components/StudentTable';

describe('getGradeBadgeColor', () => {
  it('assigns specific color classes for each grade band', () => {
    expect(getGradeBadgeColor('A')).toContain('emerald');
    expect(getGradeBadgeColor('B')).toContain('blue');
    expect(getGradeBadgeColor('C')).toContain('amber');
    expect(getGradeBadgeColor('D')).toContain('orange');
    expect(getGradeBadgeColor('F')).toContain('rose');
  });
});
