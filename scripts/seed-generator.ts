import fs from 'node:fs';
import path from 'node:path';
import { generateSeedCsv } from '../src/lib/seed/seedGenerator';

/**
 * CLI script to generate realistic messy student CSV.
 * Usage:
 *   npx tsx scripts/seed-generator.ts [--count 200] [--out students_generated.csv] [--seed 42]
 */
function main() {
  const args = process.argv.slice(2);
  let count = 100;
  let seed = 42;
  let outFile = 'students_generated.csv';

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
    }
  }

  const csvContent = generateSeedCsv({ count, seed });
  const outPath = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outPath, csvContent, 'utf-8');

  console.log(`Successfully generated ${count} rows of realistic student data at: ${outFile} (seed=${seed})`);
}

main();
