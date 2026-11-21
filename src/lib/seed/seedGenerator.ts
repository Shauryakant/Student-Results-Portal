/**
 * Deterministic generator for realistic student CSV data.
 * Incorporates every kind of data anomaly discovered in Phase 2:
 * - Duplicate IDs
 * - Wrong field counts (extra or missing columns)
 * - Format issues (invalid emails, roman numeral grades, invalid sections, text in DOB)
 * - Range violations (marks < 0 or > 100, ages < 5 or > 25)
 * - Unicode names, quoted names with commas, extra whitespace
 * - Case normalization (lowercase IDs and sections, uppercase emails)
 */

export interface SeedGeneratorOptions {
  count?: number; // Total rows to generate (default: 100)
  seed?: number; // Random seed for deterministic generation (default: 42)
  anomalyRate?: number; // Fraction of rows with anomalies (default: 0.15)
}

function createPrng(initialSeed: number) {
  let s = initialSeed >>> 0;
  return function next(): number {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Advik', 'Isha', 'Kabir', 'Rhea',
  'Reyansh', 'Pooja', 'Arjun', 'Sanya', 'Ishaan', 'Tanvi', 'Aditya', 'Meera',
  'Rohan', 'Kavita', 'Amélie', 'Müller', 'João', 'Siddharth', 'Fatima', 'Zayn',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Rao', 'Iyer', 'Gupta', 'Singh', 'Deshmukh',
  'Fernandes', 'Chopra', 'Nair', 'Bose', 'Mukherjee', 'Dupont', 'Thomas', 'Silva',
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function generateSeedCsv(options: SeedGeneratorOptions = {}): string {
  const count = options.count ?? 100;
  const seed = options.seed ?? 42;
  const anomalyRate = options.anomalyRate ?? 0.15;

  const rand = createPrng(seed);

  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const randInt = (min: number, max: number): number =>
    Math.floor(rand() * (max - min + 1)) + min;
  const randFloat = (min: number, max: number, decimals = 1): number => {
    const val = rand() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
  };

  const lines: string[] = [
    'student_id,full_name,email,date_of_birth,grade_level,section,maths,science,english,social_studies,second_language',
  ];

  const generatedIds: string[] = [];

  for (let i = 1; i <= count; i++) {
    const shouldBeAnomaly = rand() < anomalyRate;
    const anomalyType = shouldBeAnomaly ? randInt(1, 10) : 0;

    let studentId = `STU${String(i).padStart(5, '0')}`;
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    let fullName = `${firstName} ${lastName}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.edu`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // strip accents for basic email
    
    // Normal birth date: Grade 1-12 corresponds to ages ~6-18
    const gradeLevelNum = randInt(1, 12);
    let gradeLevel: string = String(gradeLevelNum);
    const birthYear = 2026 - (gradeLevelNum + 5);
    const birthMonth = String(randInt(1, 12)).padStart(2, '0');
    const birthDay = String(randInt(1, 28)).padStart(2, '0');
    
    // Mix date formats: 50% YYYY-MM-DD, 50% DD/MM/YYYY
    let dob = rand() > 0.5
      ? `${birthYear}-${birthMonth}-${birthDay}`
      : `${birthDay}/${birthMonth}/${birthYear}`;

    let section = pick(SECTIONS);
    let maths = String(randFloat(40, 98));
    let science = String(randFloat(40, 98));
    const english = String(randFloat(40, 98));
    const socialStudies = String(randFloat(40, 98));
    const secondLanguage = String(randFloat(40, 98));

    // Valid messes (should pass validation)
    if (!shouldBeAnomaly) {
      const benignMod = randInt(1, 6);
      if (benignMod === 1) {
        // Lowercase ID
        studentId = studentId.toLowerCase();
      } else if (benignMod === 2) {
        // Leading zero grade
        gradeLevel = gradeLevelNum < 10 ? `0${gradeLevelNum}` : String(gradeLevelNum);
      } else if (benignMod === 3) {
        // Uppercase email
        email = email.toUpperCase();
      } else if (benignMod === 4) {
        // Quoted name with comma: "Last, First"
        fullName = `"${lastName}, ${firstName}"`;
      } else if (benignMod === 5) {
        // Extra inner spaces in name
        fullName = `  ${firstName}   ${lastName}  `;
      } else if (benignMod === 6) {
        // Lowercase section
        section = section.toLowerCase();
      }
    } else {
      // Invalids / Anomalies
      switch (anomalyType) {
        case 1:
          // Duplicate ID (re-use a previously generated ID)
          if (generatedIds.length > 0) {
            studentId = pick(generatedIds);
          }
          break;
        case 2:
          // Wrong field count (missing column)
          lines.push(`${studentId},${fullName},${email},${dob},${gradeLevel},${section},${maths},${science}`);
          continue;
        case 3:
          // Wrong field count (extra columns)
          lines.push(`${studentId},${fullName},${email},${dob},${gradeLevel},${section},${maths},${science},${english},${socialStudies},${secondLanguage},EXTRA_COL1,EXTRA_COL2`);
          continue;
        case 4:
          // Missing required field (empty name)
          fullName = '';
          break;
        case 5:
          // Invalid email format (missing domain/TLD)
          email = `${firstName.toLowerCase()}@invalid`;
          break;
        case 6:
          // Out of range DOB (future date or age > 25)
          dob = rand() > 0.5 ? '2030-01-01' : '1985-05-12';
          break;
        case 7:
          // Invalid DOB format (text)
          dob = 'yesterday';
          break;
        case 8:
          // Invalid grade level format (Roman numeral)
          gradeLevel = 'XII';
          break;
        case 9:
          // Invalid section (e.g. 'Z')
          section = 'Z';
          break;
        case 10:
          // Out of range marks (e.g. 105 or -10)
          if (rand() > 0.5) {
            maths = '105.5';
          } else {
            science = '-15';
          }
          break;
      }
    }

    generatedIds.push(studentId.trim().toUpperCase());

    // Quote name if it contains commas
    const formattedName = fullName.includes(',') && !fullName.startsWith('"')
      ? `"${fullName}"`
      : fullName;

    lines.push(
      `${studentId},${formattedName},${email},${dob},${gradeLevel},${section},${maths},${science},${english},${socialStudies},${secondLanguage}`,
    );
  }

  return lines.join('\n') + '\n';
}
