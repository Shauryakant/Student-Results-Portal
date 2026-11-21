import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '@/app/api/students/route';
import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { closeMongoClient, COLLECTIONS } from '@/lib/db/mongodb';

describe('GET /api/students', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    client = new MongoClient(mongod.getUri());
    await client.connect();

    const db = client.db('student_portal');
    await db.collection(COLLECTIONS.STUDENTS).insertMany([
      {
        student_id: 'STU00001',
        full_name: 'Aarav Sharma',
        name_search: 'aarav sharma',
        grade_level: 9,
        section: 'B',
        marks: { maths: 82, science: 74, english: 79, social_studies: 71, second_language: 86 },
        total: 392,
        percentage: 78.4,
      },
      {
        student_id: 'STU00002',
        full_name: 'Sneha Malhotra',
        name_search: 'sneha malhotra',
        grade_level: 11,
        section: 'F',
        marks: { maths: 70, science: 65, english: 80, social_studies: 68, second_language: 72 },
        total: 355,
        percentage: 71.0,
      },
      {
        student_id: 'STU00003',
        full_name: 'Aarav Patel',
        name_search: 'aarav patel',
        grade_level: 9,
        section: 'A',
        marks: { maths: 90, science: 85, english: 88, social_studies: 92, second_language: 89 },
        total: 444,
        percentage: 88.8,
      },
    ]);
  }, 30000);

  afterAll(async () => {
    if (client) await client.close();
    await closeMongoClient();
    if (mongod) await mongod.stop();
  });

  it('returns all students with pagination metadata and stable sorting by student_id', async () => {
    const req = new NextRequest('http://localhost:8080/api/students?page=1&limit=2');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.students).toHaveLength(2);
    expect(json.students[0].student_id).toBe('STU00001');
    expect(json.students[1].student_id).toBe('STU00002');
    expect(json.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    // Check computed fields
    expect(json.students[0].percentage_display).toBe('78.4%');
    expect(json.students[0].grade).toBe('B');
  });

  it('filters students by grade_level', async () => {
    const req = new NextRequest('http://localhost:8080/api/students?grade=11');
    const res = await GET(req);
    const json = await res.json();

    expect(json.students).toHaveLength(1);
    expect(json.students[0].student_id).toBe('STU00002');
    expect(json.pagination.total).toBe(1);
  });

  it('searches students by name_search', async () => {
    const req = new NextRequest('http://localhost:8080/api/students?search=aarav');
    const res = await GET(req);
    const json = await res.json();

    expect(json.students).toHaveLength(2);
    expect(json.students.map((s: { student_id: string }) => s.student_id)).toEqual([
      'STU00001',
      'STU00003',
    ]);
  });

  it('searches students by student_id (case-insensitive)', async () => {
    const req = new NextRequest('http://localhost:8080/api/students?search=stu00003');
    const res = await GET(req);
    const json = await res.json();

    expect(json.students).toHaveLength(1);
    expect(json.students[0].student_id).toBe('STU00003');
  });

  it('handles empty results and invalid page gracefully', async () => {
    const req = new NextRequest('http://localhost:8080/api/students?search=nonexistent&page=-1');
    const res = await GET(req);
    const json = await res.json();

    expect(json.students).toHaveLength(0);
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.total).toBe(0);
    expect(json.pagination.totalPages).toBe(1);
  });
});
