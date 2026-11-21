import { describe, it, expect } from 'vitest';
import { formatFileSize, REQUIRED_COLUMNS_PREVIEW } from '@/components/FileDropzone';

describe('formatFileSize', () => {
  it('formats bytes, kilobytes, and megabytes accurately', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(491520)).toBe('480.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('contains all 11 required columns', () => {
    expect(REQUIRED_COLUMNS_PREVIEW).toHaveLength(11);
    expect(REQUIRED_COLUMNS_PREVIEW).toContain('student_id');
    expect(REQUIRED_COLUMNS_PREVIEW).toContain('maths');
  });
});
