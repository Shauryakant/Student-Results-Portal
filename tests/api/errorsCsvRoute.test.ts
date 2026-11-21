import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '@/app/api/imports/[id]/errors.csv/route';
import { sanitizeCsvCell } from '@/lib/import/csvSanitize';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import { closeMongoClient, COLLECTIONS } from '@/lib/db/mongodb';

describe('sanitizeCsvCell', () => {
  it('prefixes formulas starting with =, +, -, @ with single quote', () => {
    expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvCell('+123456789')).toBe("'+123456789");
    expect(sanitizeCsvCell('-5')).toBe("'-5");
    expect(sanitizeCsvCell('@special')).toBe("'@special");
  });

  it('escapes cells containing commas and double quotes per RFC 4180', () => {
    expect(sanitizeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(sanitizeCsvCell('Said "Hello"')).toBe('"Said ""Hello"""');
  });

  it('handles null, undefined, numbers', () => {
    expect(sanitizeCsvCell(null)).toBe('');
    expect(sanitizeCsvCell(undefined)).toBe('');
    expect(sanitizeCsvCell(14)).toBe('14');
  });
});

describe('GET /api/imports/[id]/errors.csv', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    client = new MongoClient(mongod.getUri());
    await client.connect();
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    await closeMongoClient();
    if (mongod) await mongod.stop();
  });

  it('returns 404 if import ID is invalid format', async () => {
    const req = new NextRequest('http://localhost:8080/api/imports/not-a-valid-id/errors.csv');
    const res = await GET(req, { params: Promise.resolve({ id: 'not-a-valid-id' }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain('Invalid import ID');
  });

  it('returns 404 if import record does not exist', async () => {
    const randomId = new ObjectId().toString();
    const req = new NextRequest(`http://localhost:8080/api/imports/${randomId}/errors.csv`);
    const res = await GET(req, { params: Promise.resolve({ id: randomId }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain('Import not found');
  });

  it('returns downloadable CSV with correct headers and sanitized problem rows', async () => {
    const db = client.db('student_portal');
    const importId = new ObjectId();

    await db.collection(COLLECTIONS.IMPORTS).insertOne({
      _id: importId,
      filename: 'sample.csv',
      started_at: new Date(),
      finished_at: new Date(),
      rows_read: 25,
      imported: 16,
      new_count: 16,
      updated_count: 0,
      rejected: 2,
      problems: [
        {
          row: 6,
          student_id: 'STU00005',
          field: 'maths',
          code: 'OUT_OF_RANGE',
          message: '-5 is outside the allowed range 0 to 100',
        },
        {
          row: 14,
          student_id: '=CMD()', // Test injection protection in report
          field: 'email',
          code: 'INVALID_FORMAT',
          message: 'Invalid email address, please check',
        },
      ],
      status: 'COMPLETED',
    });

    const req = new NextRequest(
      `http://localhost:8080/api/imports/${importId.toString()}/errors.csv`,
    );
    const res = await GET(req, {
      params: Promise.resolve({ id: importId.toString() }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect(res.headers.get('content-disposition')).toBe(
      `attachment; filename="errors-${importId.toString()}.csv"`,
    );

    const csvText = await res.text();
    const lines = csvText.split('\r\n');
    expect(lines[0]).toBe('row,student_id,field,problem,code');

    // First problem: STU00005 (message starts with -, so it has formula guard prefix)
    expect(lines[1]).toContain("6,STU00005,maths,'-5 is outside the allowed range 0 to 100,OUT_OF_RANGE");

    // Second problem: '=CMD() has formula guard single quote
    expect(lines[2]).toContain("'=CMD()");
  });
});
