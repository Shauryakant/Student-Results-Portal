import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/db/mongodb';
import { computeStudentGrading } from '@/lib/validation/grading';
import { Marks } from '@/lib/validation/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !id.trim()) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 },
      );
    }

    const studentId = id.trim().toUpperCase();

    const db = await getDb();
    const student = await db
      .collection(COLLECTIONS.STUDENTS)
      .findOne({ student_id: studentId });

    if (!student) {
      return NextResponse.json(
        { error: `Student with ID "${studentId}" not found` },
        { status: 404 },
      );
    }

    const marks: Marks = student.marks || {
      maths: 0,
      science: 0,
      english: 0,
      social_studies: 0,
      second_language: 0,
    };

    const gradingReport = computeStudentGrading(marks);

    // Format DOB for presentation (e.g. "14 March 2012")
    let dobFormatted = '';
    if (student.date_of_birth) {
      const d = new Date(student.date_of_birth);
      if (!isNaN(d.getTime())) {
        dobFormatted = d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });
      }
    }

    return NextResponse.json(
      {
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        date_of_birth: student.date_of_birth,
        date_of_birth_formatted: dobFormatted,
        grade_level: student.grade_level,
        section: student.section,
        marks,
        grading: gradingReport,
        created_at: student.created_at,
        updated_at: student.updated_at,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
