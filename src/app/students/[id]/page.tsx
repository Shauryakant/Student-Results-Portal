import { notFound } from 'next/navigation';
import { getDb, COLLECTIONS } from '@/lib/db/mongodb';
import { computeStudentGrading } from '@/lib/validation/grading';
import { Marks } from '@/lib/validation/types';
import { StudentReportView, StudentReportData } from '@/components/StudentReportView';

export const dynamic = 'force-dynamic';

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || !id.trim()) {
    notFound();
  }

  const studentId = id.trim().toUpperCase();

  const db = await getDb();
  const student = await db
    .collection(COLLECTIONS.STUDENTS)
    .findOne({ student_id: studentId });

  if (!student) {
    notFound();
  }

  const marks: Marks = student.marks || {
    maths: 0,
    science: 0,
    english: 0,
    social_studies: 0,
    second_language: 0,
  };

  const grading = computeStudentGrading(marks);

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

  const reportData: StudentReportData = {
    student_id: student.student_id,
    full_name: student.full_name,
    email: student.email,
    date_of_birth: student.date_of_birth,
    date_of_birth_formatted: dobFormatted,
    grade_level: student.grade_level,
    section: student.section,
    marks,
    grading,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StudentReportView student={reportData} />
    </div>
  );
}
