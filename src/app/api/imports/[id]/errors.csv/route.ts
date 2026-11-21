import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '@/lib/db/mongodb';
import { ProblemReport } from '@/lib/validation/types';

/**
 * Sanitizes a CSV cell to prevent spreadsheet formula injection (CSV injection).
 * If the value starts with =, +, -, @, or tab/CR, it prefixes it with a single quote.
 * Quotes and commas are properly escaped per RFC 4180.
 */
export function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection guard: Excel/LibreOffice/Google Sheets execute cells starting with =, +, -, @
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180 CSV escaping: if contains quotes, commas, or newlines, wrap in quotes and double quotes
  if (
    str.includes('"') ||
    str.includes(',') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

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
