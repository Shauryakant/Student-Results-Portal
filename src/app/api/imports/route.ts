import { NextRequest, NextResponse } from 'next/server';
import { executeImport } from '@/lib/import/importService';

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided in form field "file"' },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds maximum upload size of 5MB' },
        { status: 413 },
      );
    }

    const filename = (file as File).name || 'upload.csv';
    const buffer = Buffer.from(await file.arrayBuffer());

    const summary = await executeImport(filename, buffer);

    if (summary.status === 'FAILED') {
      return NextResponse.json(
        {
          error: summary.errorMessage || 'File import failed validation',
          importId: summary.importId,
          filename: summary.filename,
        },
        { status: 400 },
      );
    }

    // Limit returned problems to first 50 to keep payload responsive
    const problemsPreview = summary.problems.slice(0, 50);

    return NextResponse.json(
      {
        success: true,
        importId: summary.importId,
        filename: summary.filename,
        rowsRead: summary.rowsRead,
        imported: summary.imported,
        newCount: summary.newCount,
        updatedCount: summary.updatedCount,
        rejected: summary.rejected,
        problemsCount: summary.problemsCount,
        problems: problemsPreview,
        hasMoreProblems: summary.problemsCount > 50,
        startedAt: summary.startedAt,
        finishedAt: summary.finishedAt,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
