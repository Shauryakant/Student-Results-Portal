import { describe, it, expect } from 'vitest';
import { parseCsv, isAllEmptyRow } from './csvParser';

describe('isAllEmptyRow', () => {
  it('identifies blank line or all empty fields', () => {
    expect(isAllEmptyRow([])).toBe(true);
    expect(isAllEmptyRow([''])).toBe(true);
    expect(isAllEmptyRow(['  ', '', '   '])).toBe(true);
    expect(isAllEmptyRow(['', '', 'STU001', ''])).toBe(false);
  });
});

describe('parseCsv', () => {
  const header =
    'student_id,full_name,email,date_of_birth,grade_level,section,maths,science,english,social_studies,second_language';

  it('correctly tracks line numbers across blank lines and all-empty rows', async () => {
    const csvContent = [
      header, // Line 1
      'STU001,John Doe,john@example.com,2010-01-01,9,A,80,85,90,75,80', // Line 2
      '', // Line 3 (blank line)
      ',,,,,,,,,,', // Line 4 (all-empty line)
      'STU002,Jane Doe,jane@example.com,2010-02-02,9,B,70,75,80,85,90', // Line 5
    ].join('\r\n');

    const result = await parseCsv(csvContent);

    expect(result.headerAnalysis.isValid).toBe(true);
    expect(result.rows).toHaveLength(2); // Only 2 actual student rows

    expect(result.rows[0].lineNumber).toBe(2);
    expect(result.rows[0].studentIdRaw).toBe('STU001');

    expect(result.rows[1].lineNumber).toBe(5);
    expect(result.rows[1].studentIdRaw).toBe('STU002');
  });

  it('flags rows with WRONG_FIELD_COUNT', async () => {
    const csvContent = [
      header, // Line 1 (11 cols)
      'STU001,John Doe,john@example.com,2010-01-01,9,A,80,85,90,75,80', // Line 2 (11 cols - valid count)
      'STU002,Jane Doe,jane@example.com,2010-02-02,9,B,70,75,80', // Line 3 (9 cols - wrong count)
      'STU003,Bob Smith,bob@example.com,2010-03-03,9,C,70,75,80,85,90,EXTRA1,EXTRA2', // Line 4 (13 cols - wrong count)
    ].join('\n');

    const result = await parseCsv(csvContent);
    expect(result.rows).toHaveLength(3);

    expect(result.rows[0].isWrongFieldCount).toBe(false);
    expect(result.rows[1].isWrongFieldCount).toBe(true);
    expect(result.rows[1].studentIdRaw).toBe('STU002');
    expect(result.rows[2].isWrongFieldCount).toBe(true);
    expect(result.rows[2].studentIdRaw).toBe('STU003');
  });

  it('handles UTF-8 BOM properly', async () => {
    const bomCsv = Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from(
        `${header}\nSTU001,John Doe,john@example.com,2010-01-01,9,A,80,85,90,75,80`,
      ),
    ]);

    const result = await parseCsv(bomCsv);
    expect(result.headerAnalysis.isValid).toBe(true);
    expect(result.headerAnalysis.columnIndexMap.get('student_id')).toBe(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].studentIdRaw).toBe('STU001');
  });

  it('handles quoted fields with commas (e.g. "Patel, Sahil")', async () => {
    const csvContent = [
      header,
      'STU001,"Patel, Sahil",sahil@example.com,2010-01-01,9,A,80,85,90,75,80',
    ].join('\n');

    const result = await parseCsv(csvContent);
    expect(result.rows[0].rowObject?.['full_name']).toBe('Patel, Sahil');
  });

  it('handles extra columns in header and maps required fields accurately', async () => {
    const headerWithExtra = `${header},parent_phone`;
    const csvContent = [
      headerWithExtra,
      'STU001,John Doe,john@example.com,2010-01-01,9,A,80,85,90,75,80,+91 9999999999',
    ].join('\n');

    const result = await parseCsv(csvContent);
    expect(result.headerAnalysis.isValid).toBe(true);
    expect(result.rows[0].isWrongFieldCount).toBe(false);
    expect(result.rows[0].rowObject?.['student_id']).toBe('STU001');
    expect(result.rows[0].rowObject?.['second_language']).toBe('80');
  });
});
