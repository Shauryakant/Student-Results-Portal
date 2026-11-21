import { describe, it, expect } from 'vitest';
import { processCsvContent } from './orchestrator';
import fs from 'fs';
import path from 'path';

describe('processCsvContent pipeline', () => {
  const referenceToday = new Date('2026-11-21');

  it('correctly processes students_small.csv to exactly 16 imported and 9 rejected', async () => {
    const filePath = path.resolve(process.cwd(), 'students_small.csv');
    const content = fs.readFileSync(filePath);

    const result = await processCsvContent(content, referenceToday);

    expect(result.status).toBe('COMPLETED');
    expect(result.rowsRead).toBe(25);
    expect(result.importedCount).toBe(16);
    expect(result.rejectedCount).toBe(9);
    expect(result.validStudents).toHaveLength(16);
  });

  it('correctly processes students_sample.csv to exactly 4,685 imported, 315 rejected, and 348 problems', async () => {
    const filePath = path.resolve(process.cwd(), 'students_sample.csv');
    const content = fs.readFileSync(filePath);

    const result = await processCsvContent(content, referenceToday);

    expect(result.status).toBe('COMPLETED');
    expect(result.rowsRead).toBe(5000);
    expect(result.importedCount).toBe(4685);
    expect(result.rejectedCount).toBe(315);
    expect(result.validStudents).toHaveLength(4685);
    // Exact 348 problems as displayed in the appendix screen sketches
    expect(result.problems).toHaveLength(348);
  });

  it('returns friendly error on missing required header columns', async () => {
    const badCsv = 'student_id,full_name,email\nSTU01,Alice,alice@example.com';
    const result = await processCsvContent(badCsv, referenceToday);

    expect(result.status).toBe('FAILED');
    expect(result.rowsRead).toBe(0);
    expect(result.errorMessage).toContain('Missing required column(s)');
  });
});
