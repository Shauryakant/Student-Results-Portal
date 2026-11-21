import { Marks } from './types';

export type GradeBand = 'A' | 'B' | 'C' | 'D' | 'F';
export type ResultStatus = 'PASS' | 'FAIL';

export interface SubjectResult {
  subject: keyof Marks;
  label: string;
  marks: number;
  maxMarks: number;
  passed: boolean;
}

export interface StudentGradingReport {
  total: number;
  maxTotal: number;
  percentage: number;
  percentageDisplay: string;
  grade: GradeBand;
  status: ResultStatus;
  subjectResults: SubjectResult[];
  failingSubjects: string[];
}

export const SUBJECT_LABELS: Record<keyof Marks, string> = {
  maths: 'Maths',
  science: 'Science',
  english: 'English',
  social_studies: 'Social Studies',
  second_language: 'Second Language',
};

const PASSING_SUBJECT_MARK = 33;
const PASSING_OVERALL_PERCENTAGE = 35;

/**
 * Calculates grade band from overall percentage.
 * Grade bands:
 * - A: >= 80%
 * - B: >= 65% and < 80%
 * - C: >= 50% and < 65%
 * - D: >= 35% and < 50%
 * - F: < 35%
 */
export function calculateGrade(percentage: number): GradeBand {
  if (percentage >= 80) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
}

/**
 * Formats percentage rounded to 1 decimal place for display.
 */
export function formatPercentage(percentage: number): string {
  const rounded = Math.round(percentage * 10) / 10;
  return `${rounded.toFixed(1)}%`;
}

/**
 * Computes complete grading and pass/fail evaluation for a student's marks.
 * Pass criteria:
 * - Overall percentage >= 35%
 * - Each subject mark >= 33
 */
export function computeStudentGrading(marks: Marks): StudentGradingReport {
  const subjects: (keyof Marks)[] = [
    'maths',
    'science',
    'english',
    'social_studies',
    'second_language',
  ];

  let total = 0;
  const failingSubjects: string[] = [];

  const subjectResults: SubjectResult[] = subjects.map((subj) => {
    const mark = marks[subj];
    total += mark;
    const passed = mark >= PASSING_SUBJECT_MARK;
    if (!passed) {
      failingSubjects.push(SUBJECT_LABELS[subj]);
    }
    return {
      subject: subj,
      label: SUBJECT_LABELS[subj],
      marks: mark,
      maxMarks: 100,
      passed,
    };
  });

  const maxTotal = 500;
  const percentage = (total / maxTotal) * 100;
  const grade = calculateGrade(percentage);

  const passedOverall =
    percentage >= PASSING_OVERALL_PERCENTAGE && failingSubjects.length === 0;

  return {
    total,
    maxTotal,
    percentage,
    percentageDisplay: formatPercentage(percentage),
    grade,
    status: passedOverall ? 'PASS' : 'FAIL',
    subjectResults,
    failingSubjects,
  };
}
