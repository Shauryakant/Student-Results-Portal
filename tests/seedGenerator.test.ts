import { describe, it, expect } from 'vitest';
import { generateSeedCsv } from '@/lib/seed/seedGenerator';
import { processCsvContent } from '@/lib/import/orchestrator';

describe('Seed CSV Generator', () => {
  it('is deterministic for the same seed', () => {
    const csv1 = generateSeedCsv({ count: 50, seed: 123 });
    const csv2 = generateSeedCsv({ count: 50, seed: 123 });
    expect(csv1).toBe(csv2);
  });

  it('generates different data for different seeds', () => {
    const csv1 = generateSeedCsv({ count: 50, seed: 123 });
    const csv2 = generateSeedCsv({ count: 50, seed: 456 });
    expect(csv1).not.toBe(csv2);
  });

  it('produces valid CSV header', () => {
    const csv = generateSeedCsv({ count: 10, seed: 42 });
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe(
      'student_id,full_name,email,date_of_birth,grade_level,section,maths,science,english,social_studies,second_language',
    );
  });

  it('imports through the validation orchestrator with both imported and rejected rows', async () => {
    const csv = generateSeedCsv({ count: 100, seed: 42, anomalyRate: 0.2 });
    const result = await processCsvContent(csv, new Date('2026-11-21'));

    expect(result.status).toBe('COMPLETED');
    expect(result.rowsRead).toBe(100);
    expect(result.validStudents.length).toBeGreaterThan(60);
    expect(result.rejectedCount).toBeGreaterThan(0);
    expect(result.problems.length).toBeGreaterThan(0);

    // Verify presence of anomaly codes
    const codes = new Set(result.problems.map((p) => p.code));
    expect(codes.size).toBeGreaterThan(1);
  });
});
