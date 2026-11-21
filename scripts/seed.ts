import fs from 'node:fs';
import path from 'node:path';
import { generateSeedCsv } from '../src/lib/seed/seedGenerator';
import { executeImport } from '../src/lib/import/importService';
import { closeMongoClient } from '../src/lib/db/mongodb';

// Automatically load .env.local or .env if present and process.loadEnvFile is available
try {
  const envLocal = path.resolve(process.cwd(), '.env.local');
  const envDefault = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envLocal) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envLocal);
  } else if (fs.existsSync(envDefault) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envDefault);
  }
} catch {
  // Ignore env file load error if already provided via environment
}

/**
 * Seed script: generates realistic messy CSV and loads it into MongoDB.
 * Usage:
 *   npm run seed
 *   npm run seed -- --count 300 --seed 99
 *   npm run seed -- --generate-only --out custom.csv
 */
async function main() {
  const args = process.argv.slice(2);
  let count = 200;
  let seed = 42;
  let outFile = 'students_seed.csv';
  let generateOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--seed' && args[i + 1]) {
      seed = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--out' && args[i + 1]) {
      outFile = args[i + 1];
      i++;
    } else if (args[i] === '--generate-only' || args[i] === '--no-load') {
      generateOnly = true;
    }
  }

  console.log(`[Seed] Generating ${count} realistic student records (seed: ${seed})...`);
  const csvContent = generateSeedCsv({ count, seed, anomalyRate: 0.15 });
  const outPath = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outPath, csvContent, 'utf-8');
  console.log(`[Seed] Written seed CSV to: ${outFile}`);

  if (generateOnly) {
    console.log('[Seed] --generate-only specified. Skipping MongoDB load.');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.trim() === '') {
    console.warn(
      '\n[Warning] MONGODB_URI is not set. Seed file was generated on disk, but not loaded into MongoDB.\n' +
        'To load data into MongoDB, set MONGODB_URI in your environment or in .env, or run:\n' +
        '  MONGODB_URI="mongodb+srv://..." npm run seed\n',
    );
    return;
  }

  console.log('[Seed] Connecting to MongoDB and executing import pipeline...');
  try {
    const summary = await executeImport(outFile, csvContent);
    console.log('\n================ Import Summary ================');
    console.log(`Import ID:      ${summary.importId}`);
    console.log(`Rows Read:      ${summary.rowsRead}`);
    console.log(`Imported:       ${summary.imported} (${summary.newCount} new, ${summary.updatedCount} updated)`);
    console.log(`Rejected:       ${summary.rejected}`);
    console.log(`Problems Found: ${summary.problemsCount}`);
    console.log('================================================\n');
    console.log('[Seed] Seed completed successfully!');
  } catch (err) {
    console.error('[Seed] Import failed with error:', err);
    process.exitCode = 1;
  } finally {
    await closeMongoClient();
  }
}

main();
