import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '@/app/api/students/[id]/route';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { closeMongoClient, COLLECTIONS } from '@/lib/db/mongodb';

describe('GET /api/students/[id]', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    client = new MongoClient(mongod.getUri());
    await client.connect();

    const db = client.db('student_portal');
    await db.collection(COLLECTIONS.STUDENTS).insertOne({
      student_id: 'STU00123',
      full_name: 'Aarav Sharma',
      name_search: 'aarav sharma',
      email: 'aarav.sharma42@example.edu',
      date_of_birth: new Date('2012-03-14T00:00:00.000Z'),
      grade_level: 9,
      section: 'B',
      marks: {
        maths: 82,
        science: 74,
        english: 79,
        social_studies: 71,
        second_language: 86,
      },
      total: 392,
      percentage: 78.4,
    });
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    await closeMongoClient();
    if (mongod) await mongod.stop();
  });

  it('returns 404 if student does not exist', async () => {
    const req = new NextRequest('http://localhost:8080/api/students/UNKNOWN');
    const res = await GET(req, { params: Promise.resolve({ id: 'UNKNOWN' }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain('not found');
  });

  it('retrieves student by ID case-insensitively and computes grading breakdown', async () => {
    const req = new NextRequest('http://localhost:8080/api/students/stu00123');
    const res = await GET(req, { params: Promise.resolve({ id: 'stu00123' }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.student_id).toBe('STU00123');
    expect(json.full_name).toBe('Aarav Sharma');
    expect(json.email).toBe('aarav.sharma42@example.edu');
    expect(json.grade_level).toBe(9);
    expect(json.section).toBe('B');
    expect(json.date_of_birth_formatted).toBe('14 March 2012');

    // Computed grading matching brief sketch
    expect(json.grading.total).toBe(392);
    expect(json.grading.percentageDisplay).toBe('78.4%');
    expect(json.grading.grade).toBe('B');
    expect(json.grading.status).toBe('PASS');
    expect(json.grading.subjectResults).toHaveLength(5);
  });
});
