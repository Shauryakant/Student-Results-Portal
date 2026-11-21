import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { executeImport } from '../src/lib/import/importService';
import { COLLECTIONS } from '../src/lib/db/mongodb';
import fs from 'fs';
import path from 'path';

describe('Golden Import Benchmark & Edge Case Tests', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  const referenceToday = new Date('2026-11-21');

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    client = new MongoClient(mongod.getUri());
    await client.connect();
    db = client.db('golden_test_db');
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongod) await mongod.stop();
  });

  it('Golden Benchmark 1: students_small.csv => exactly 16 imported / 9 rejected', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/students_small.csv');
    const content = fs.readFileSync(filePath);

    const summary = await executeImport('students_small.csv', content, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('COMPLETED');
    expect(summary.rowsRead).toBe(25);
    expect(summary.imported).toBe(16);
    expect(summary.newCount).toBe(16);
    expect(summary.updatedCount).toBe(0);
    expect(summary.rejected).toBe(9);

    const count = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
    expect(count).toBe(16);
  });

  it('Golden Benchmark 2: students_sample.csv => exactly 4,685 imported / 315 rejected', async () => {
    // Clear students collection to test pristine import of 5,000 rows
    await db.collection(COLLECTIONS.STUDENTS).deleteMany({});

    const filePath = path.resolve(__dirname, 'fixtures/students_sample.csv');
    const content = fs.readFileSync(filePath);

    const summary = await executeImport('students_sample.csv', content, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('COMPLETED');
    expect(summary.rowsRead).toBe(5000);
    expect(summary.imported).toBe(4685);
    expect(summary.newCount).toBe(4685);
    expect(summary.updatedCount).toBe(0);
    expect(summary.rejected).toBe(315);
    expect(summary.problemsCount).toBe(348);

    const count = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
    expect(count).toBe(4685);
  });

  it('Golden Benchmark 3: Re-upload idempotency of students_sample.csv', async () => {
    // Uploading students_sample.csv a second time
    const filePath = path.resolve(__dirname, 'fixtures/students_sample.csv');
    const content = fs.readFileSync(filePath);

    const summary2 = await executeImport('students_sample.csv', content, {
      db,
      today: referenceToday,
    });

    expect(summary2.status).toBe('COMPLETED');
    expect(summary2.rowsRead).toBe(5000);
    expect(summary2.imported).toBe(4685);
    expect(summary2.newCount).toBe(0); // 0 new records
    expect(summary2.updatedCount).toBe(4685); // 4685 existing updated
    expect(summary2.rejected).toBe(315);

    // Total documents in DB must remain exactly 4685
    const count = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
    expect(count).toBe(4685);
  });

  it('Edge Case: handles UTF-8 BOM with Windows CRLF line endings cleanly', async () => {
    const crlfCsv = Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from(
        'student_id,full_name,email,date_of_birth,grade_level,section,maths,science,english,social_studies,second_language\r\n' +
          'BOM001,Alice Wonder,alice@example.com,2010-05-12,9,A,85,90,92,88,86\r\n',
      ),
    ]);

    const summary = await executeImport('bom_crlf.csv', crlfCsv, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('COMPLETED');
    expect(summary.rowsRead).toBe(1);
    expect(summary.imported).toBe(1);

    const student = await db.collection(COLLECTIONS.STUDENTS).findOne({ student_id: 'BOM001' });
    expect(student).toBeDefined();
    expect(student?.full_name).toBe('Alice Wonder');
  });

  it('Edge Case: rejects binary files with a friendly error and never crashes', async () => {
    const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header with null byte

    const summary = await executeImport('image.png', binaryData, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('FAILED');
    expect(summary.errorMessage).toContain('binary file detected');
    expect(summary.rowsRead).toBe(0);
    expect(summary.imported).toBe(0);
  });

  it('Edge Case: rejects empty files with a friendly error and never crashes', async () => {
    const emptyData = Buffer.from('');

    const summary = await executeImport('empty.csv', emptyData, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('FAILED');
    expect(summary.errorMessage).toContain('File is empty');
    expect(summary.rowsRead).toBe(0);
  });

  it('Edge Case: rejects files missing required header columns', async () => {
    const badHeader = 'student_id,full_name,email\nSTU01,Bob,bob@example.com';

    const summary = await executeImport('bad_header.csv', badHeader, {
      db,
      today: referenceToday,
    });

    expect(summary.status).toBe('FAILED');
    expect(summary.errorMessage).toContain('Missing required column(s)');
    expect(summary.rowsRead).toBe(0);
  });
});
