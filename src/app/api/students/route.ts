import { NextRequest, NextResponse } from 'next/server';
import { Filter } from 'mongodb';
import { getDb, COLLECTIONS } from '@/lib/db/mongodb';
import { calculateGrade, formatPercentage } from '@/lib/validation/grading';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const searchParam = searchParams.get('search')?.trim() || '';
    const gradeParam = searchParams.get('grade')?.trim() || '';
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);

    const page = isNaN(pageParam) || pageParam < 1 ? DEFAULT_PAGE : pageParam;
    const limit =
      isNaN(limitParam) || limitParam < 1
        ? DEFAULT_LIMIT
        : Math.min(limitParam, MAX_LIMIT);

    const filter: Filter<Record<string, unknown>> = {};

    // Filter by grade_level if provided
    if (gradeParam && gradeParam !== 'all') {
      const grade = parseInt(gradeParam, 10);
      if (!isNaN(grade) && grade >= 1 && grade <= 12) {
        filter['grade_level'] = grade;
      }
    }

    // Filter by search query (name or student_id)
    if (searchParam) {
      const escaped = searchParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name_search: { $regex: escaped.toLowerCase() } },
        { student_id: { $regex: escaped.toUpperCase() } },
      ];
    }

    const db = await getDb();
    const studentsCol = db.collection(COLLECTIONS.STUDENTS);

    const total = await studentsCol.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    // Stable sort by student_id ascending
    const records = await studentsCol
      .find(filter)
      .sort({ student_id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const students = records.map((doc) => {
      const percentage = typeof doc.percentage === 'number' ? doc.percentage : 0;
      return {
        student_id: doc.student_id,
        full_name: doc.full_name,
        grade_level: doc.grade_level,
        section: doc.section,
        total: doc.total,
        percentage,
        percentage_display: formatPercentage(percentage),
        grade: calculateGrade(percentage),
      };
    });

    return NextResponse.json(
      {
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
