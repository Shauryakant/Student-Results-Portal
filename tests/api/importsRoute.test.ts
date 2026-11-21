import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { POST } from '@/app/api/imports/route';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { closeMongoClient } from '@/lib/db/mongodb';

describe('POST /api/imports', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
  }, 30000);

  afterAll(async () => {
    await closeMongoClient();
    if (mongod) await mongod.stop();
  });

  it('rejects request with missing multipart header with 400', async () => {
    const req = new NextRequest('http://localhost:8080/api/imports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('multipart/form-data');
  });

  it('rejects request when no file is included in formData with 400', async () => {
    const formData = new FormData();
    formData.append('notes', 'no file here');

    const req = new NextRequest('http://localhost:8080/api/imports', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('No file provided');
  });

  it('rejects files larger than 5MB with 413', async () => {
    // 5MB + 10 bytes
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 10, 'a');
    const file = new File([largeBuffer], 'large.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:8080/api/imports', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toContain('5MB');
  });

  it('accepts and imports valid CSV upload', async () => {
    const csvContent =
      'student_id,full_name,email,date_of_birth,grade_level,section,maths,science,english,social_studies,second_language\n' +
      'STU99001,Aarav Patel,aarav@example.com,2010-04-15,10,A,85,90,88,82,79\n' +
      'STU99002,Sneha Roy,sneha@example.com,2010-05-16,10,B,75,80,82,78,85\n';

    const file = new File([csvContent], 'valid_test.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:8080/api/imports', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.rowsRead).toBe(2);
    expect(json.imported).toBe(2);
    expect(json.newCount).toBe(2);
    expect(json.rejected).toBe(0);
    expect(json.importId).toBeDefined();
  });

  it('returns friendly 400 when uploaded file is missing required columns', async () => {
    const badCsv = 'student_id,full_name,email\nSTU01,Alice,alice@example.com';
    const file = new File([badCsv], 'bad.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:8080/api/imports', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Missing required column(s)');
  });
});
