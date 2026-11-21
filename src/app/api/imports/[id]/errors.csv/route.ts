import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '@/lib/db/mongodb';
import { ProblemReport } from '@/lib/validation/types';
import { sanitizeCsvCell } from '@/lib/import/csvSanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json(
        { error: 'Invalid import ID' },
        { status: 404 },
      );
    }

    const db = await getDb();
    const importRecord = await db
      .collection(COLLECTIONS.IMPORTS)
      .findOne({ _id: objectId });

    if (!importRecord) {
      return NextResponse.json(
        { error: 'Import not found' },
        { status: 404 },
      );
    }

    const problems: ProblemReport[] = importRecord.problems || [];

    // CSV Header row
    const headers = ['row', 'student_id', 'field', 'problem', 'code'];
    const csvRows: string[] = [headers.join(',')];

    for (const prob of problems) {
      const row = [
        sanitizeCsvCell(prob.row),
        sanitizeCsvCell(prob.student_id),
        sanitizeCsvCell(prob.field),
        sanitizeCsvCell(prob.message),
        sanitizeCsvCell(prob.code),
      ].join(',');
      csvRows.push(row);
    }

    const csvContent = csvRows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="errors-${id}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
