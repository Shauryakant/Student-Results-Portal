import { Db, ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '../db/mongodb';
import { processCsvContent } from './orchestrator';
import { ImportSummary } from './types';

const BATCH_SIZE = 1000;

/**
 * Ensures required collections and indexes are set up in MongoDB.
 * - unique index on student_id
 * - index on name_search for search queries
 * - compound index on (grade_level, section) for class filtering
 * - index on started_at for imports history
 */
export async function ensureIndexes(db: Db): Promise<void> {
  const students = db.collection(COLLECTIONS.STUDENTS);
  await students.createIndex({ student_id: 1 }, { unique: true });
  await students.createIndex({ name_search: 1 });
  await students.createIndex({ grade_level: 1, section: 1 });

  const imports = db.collection(COLLECTIONS.IMPORTS);
  await imports.createIndex({ started_at: -1 });
}

export interface ImportOptions {
  db?: Db;
  today?: Date;
}

/**
 * Imports a student CSV file into MongoDB Atlas:
 * 1. Parses and validates CSV content
 * 2. Persists valid rows in batches using bulkWrite upserts
 * 3. Accurately counts new vs updated records
 * 4. Records the import run in the `imports` collection
 */
export async function executeImport(
  filename: string,
  content: string | Buffer,
  options: ImportOptions = {},
): Promise<ImportSummary> {
  const startedAt = new Date();
  const db = options.db || (await getDb());
  await ensureIndexes(db);

  const importId = new ObjectId();
  const importResult = await processCsvContent(content, options.today);

  if (importResult.status === 'FAILED') {
    const finishedAt = new Date();
    const failedSummary: ImportSummary = {
      importId: importId.toString(),
      filename,
      rowsRead: 0,
      imported: 0,
      newCount: 0,
      updatedCount: 0,
      rejected: 0,
      problemsCount: 0,
      problems: [],
      startedAt,
      finishedAt,
      status: 'FAILED',
      errorMessage: importResult.errorMessage,
    };

    await db.collection(COLLECTIONS.IMPORTS).insertOne({
      _id: importId,
      filename,
      started_at: startedAt,
      finished_at: finishedAt,
      rows_read: 0,
      imported: 0,
      new_count: 0,
      updated_count: 0,
      rejected: 0,
      problems: [],
      status: 'FAILED',
      error_message: importResult.errorMessage,
    });

    return failedSummary;
  }

  let newCount = 0;
  let updatedCount = 0;
  const now = new Date();

  // Batch bulkWrite upserts
  const validStudents = importResult.validStudents;
  const studentsCol = db.collection(COLLECTIONS.STUDENTS);

  for (let i = 0; i < validStudents.length; i += BATCH_SIZE) {
    const batch = validStudents.slice(i, i + BATCH_SIZE);
    const operations = batch.map(({ student }) => ({
      updateOne: {
        filter: { student_id: student.student_id },
        update: {
          $set: {
            student_id: student.student_id,
            full_name: student.full_name,
            name_search: student.name_search,
            email: student.email,
            date_of_birth: student.date_of_birth,
            grade_level: student.grade_level,
            section: student.section,
            marks: student.marks,
            total: student.total,
            percentage: student.percentage,
            updated_at: now,
            last_import_id: importId,
          },
          $setOnInsert: {
            created_at: now,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      const bulkRes = await studentsCol.bulkWrite(operations, { ordered: false });
      newCount += bulkRes.upsertedCount;
      updatedCount += bulkRes.matchedCount;
    }
  }

  const finishedAt = new Date();
  const imported = newCount + updatedCount;

  await db.collection(COLLECTIONS.IMPORTS).insertOne({
    _id: importId,
    filename,
    started_at: startedAt,
    finished_at: finishedAt,
    rows_read: importResult.rowsRead,
    imported,
    new_count: newCount,
    updated_count: updatedCount,
    rejected: importResult.rejectedCount,
    problems: importResult.problems,
    status: 'COMPLETED',
  });

  return {
    importId: importId.toString(),
    filename,
    rowsRead: importResult.rowsRead,
    imported,
    newCount,
    updatedCount,
    rejected: importResult.rejectedCount,
    problemsCount: importResult.problems.length,
    problems: importResult.problems,
    startedAt,
    finishedAt,
    status: 'COMPLETED',
  };
}
