import { describe, it, expect } from 'vitest';
import { analyzeHeader, normalizeColumnName } from './header';

describe('normalizeColumnName', () => {
  it('removes UTF-8 BOM, trims whitespace, and lowercases', () => {
    expect(normalizeColumnName('\ufeffstudent_id')).toBe('student_id');
    expect(normalizeColumnName('  FULL_NAME  ')).toBe('full_name');
    expect(normalizeColumnName('\ufeff  MATHS  ')).toBe('maths');
  });
});

describe('analyzeHeader', () => {
  const standardColumns = [
    'student_id',
    'full_name',
    'email',
    'date_of_birth',
    'grade_level',
    'section',
    'maths',
    'science',
    'english',
    'social_studies',
    'second_language',
  ];

  it('validates a standard header', () => {
    const result = analyzeHeader(standardColumns);
    expect(result.isValid).toBe(true);
    expect(result.missingColumns).toHaveLength(0);
    expect(result.columnIndexMap.get('student_id')).toBe(0);
    expect(result.columnIndexMap.get('second_language')).toBe(10);
  });

  it('handles shuffled column order', () => {
    const shuffled = [...standardColumns].reverse();
    const result = analyzeHeader(shuffled);
    expect(result.isValid).toBe(true);
    expect(result.columnIndexMap.get('student_id')).toBe(10);
    expect(result.columnIndexMap.get('second_language')).toBe(0);
  });

  it('handles uppercase and surrounding whitespace', () => {
    const messy = standardColumns.map((c) => `  ${c.toUpperCase()}  `);
    const result = analyzeHeader(messy);
    expect(result.isValid).toBe(true);
    expect(result.columnIndexMap.has('student_id')).toBe(true);
  });

  it('handles UTF-8 BOM on the first column', () => {
    const bomHeader = [`\ufeff${standardColumns[0]}`, ...standardColumns.slice(1)];
    const result = analyzeHeader(bomHeader);
    expect(result.isValid).toBe(true);
    expect(result.columnIndexMap.get('student_id')).toBe(0);
  });

  it('ignores extra columns (e.g. parent_phone)', () => {
    const withExtra = [...standardColumns, 'parent_phone', 'notes'];
    const result = analyzeHeader(withExtra);
    expect(result.isValid).toBe(true);
    expect(result.columnIndexMap.has('parent_phone')).toBe(true);
  });

  it('detects missing required columns and provides clear error message', () => {
    const missing = standardColumns.filter(
      (c) => c !== 'maths' && c !== 'science',
    );
    const result = analyzeHeader(missing);
    expect(result.isValid).toBe(false);
    expect(result.missingColumns).toEqual(['maths', 'science']);
    expect(result.error).toContain('Missing required column(s): maths, science');
  });

  it('rejects empty header', () => {
    const result = analyzeHeader([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Header row is missing or empty');
  });
});
