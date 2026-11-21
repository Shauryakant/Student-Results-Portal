import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { executeImport, ensureIndexes } from './importService';
import { COLLECTIONS } from '../db/mongodb';
import fs from 'fs';
import path from 'path';

describe('importService with MongoMemoryServer', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  const referenceToday = new Date('2026-11-21');

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_student_portal');
    await ensureIndexes(db);
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongod) await mongod.stop();
  });

  it('imports students_small.csv, creates DB records, and verifies idempotency on re-upload', async () => {
    const filePath = path.resolve(process.cwd(), 'students_small.csv');
    const content = fs.readFileSync(filePath);

    // First import
    const summary1 = await executeImport('students_small.csv', content, {
      db,
      today: referenceToday,
    });

    expect(summary1.status).toBe('COMPLETED');
    expect(summary1.rowsRead).toBe(25);
    expect(summary1.imported).toBe(16);
    expect(summary1.newCount).toBe(16);
    expect(summary1.updatedCount).toBe(0);
    expect(summary1.rejected).toBe(9);

    // Verify DB count
    const countAfterFirst = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
    expect(countAfterFirst).toBe(16);

    // Verify student record fields
    const student1 = await db.collection(COLLECTIONS.STUDENTS).findOne({ student_id: 'STU00001' });
    expect(student1).toBeDefined();
    expect(student1?.full_name).toBe('Yash Fernandes');
    expect(student1?.percentage).toBeCloseTo(59.52, 2);

    // Re-upload the exact same file (idempotency check)
    const summary2 = await executeImport('students_small.csv', content, {
      db,
      today: referenceToday,
    });

    expect(summary2.status).toBe('COMPLETED');
    expect(summary2.rowsRead).toBe(25);
    expect(summary2.imported).toBe(16);
    expect(summary2.newCount).toBe(0); // 0 new!
    expect(summary2.updatedCount).toBe(16); // 16 updated!
    expect(summary2.rejected).toBe(9);

    // Verify total count in DB didn't increase
    const countAfterSecond = await db.collection(COLLECTIONS.STUDENTS).countDocuments();
    expect(countAfterSecond).toBe(16);

    // Verify imports collection has 2 records
    const importRecords = await db.collection(COLLECTIONS.IMPORTS).find().toArray();
    expect(importRecords).toHaveLength(2);
    expect(importRecords[0].imported).toBe(16);
  });
});
