import { describe, it, expect } from 'vitest';
import {
  calculateGrade,
  formatPercentage,
  computeStudentGrading,
} from './grading';
import { Marks } from './types';

describe('calculateGrade', () => {
  it('assigns grade A for percentages >= 80', () => {
    expect(calculateGrade(100)).toBe('A');
    expect(calculateGrade(80)).toBe('A');
    expect(calculateGrade(82.4)).toBe('A');
  });

  it('assigns grade B for percentages >= 65 and < 80', () => {
    expect(calculateGrade(79.9)).toBe('B');
    expect(calculateGrade(65)).toBe('B');
    expect(calculateGrade(70.3)).toBe('B');
  });

  it('assigns grade C for percentages >= 50 and < 65', () => {
    expect(calculateGrade(64.9)).toBe('C');
    expect(calculateGrade(50)).toBe('C');
    expect(calculateGrade(51.0)).toBe('C');
    expect(calculateGrade(59.9)).toBe('C');
  });

  it('assigns grade D for percentages >= 35 and < 50', () => {
    expect(calculateGrade(49.9)).toBe('D');
    expect(calculateGrade(35)).toBe('D');
    expect(calculateGrade(49.1)).toBe('D');
    expect(calculateGrade(43.2)).toBe('D');
  });

  it('assigns grade F for percentages < 35', () => {
    expect(calculateGrade(34.9)).toBe('F');
    expect(calculateGrade(20)).toBe('F');
    expect(calculateGrade(0)).toBe('F');
  });
});

describe('formatPercentage', () => {
  it('rounds to 1 decimal place and appends %', () => {
    expect(formatPercentage(78.432)).toBe('78.4%');
    expect(formatPercentage(78.48)).toBe('78.5%');
    expect(formatPercentage(70)).toBe('70.0%');
    expect(formatPercentage(51.04)).toBe('51.0%');
  });
});

describe('computeStudentGrading', () => {
  it('correctly calculates total, percentage, grade and PASS for a passing student', () => {
    const marks: Marks = {
      maths: 82,
      science: 74,
      english: 79,
      social_studies: 71,
      second_language: 86,
    };

    const report = computeStudentGrading(marks);
    expect(report.total).toBe(392);
    expect(report.maxTotal).toBe(500);
    expect(report.percentage).toBe(78.4);
    expect(report.percentageDisplay).toBe('78.4%');
    expect(report.grade).toBe('B');
    expect(report.status).toBe('PASS');
    expect(report.failingSubjects).toHaveLength(0);
    expect(report.subjectResults).toHaveLength(5);
    expect(report.subjectResults.every((s) => s.passed)).toBe(true);
  });

  it('marks student as FAIL if overall percentage is >= 35% but one subject is < 33', () => {
    const marks: Marks = {
      maths: 90,
      science: 85,
      english: 80,
      social_studies: 75,
      second_language: 28, // Failed second_language (< 33)
    };

    const report = computeStudentGrading(marks);
    expect(report.percentage).toBe(71.6);
    expect(report.grade).toBe('B');
    expect(report.status).toBe('FAIL');
    expect(report.failingSubjects).toEqual(['Second Language']);
    const failedSubject = report.subjectResults.find(
      (s) => s.subject === 'second_language',
    );
    expect(failedSubject?.passed).toBe(false);
  });

  it('marks student as FAIL if overall percentage is < 35% even if all subjects are >= 33', () => {
    // 33 * 5 = 165 -> 33% overall (< 35%)
    const marks: Marks = {
      maths: 33,
      science: 33,
      english: 34,
      social_studies: 34,
      second_language: 34,
    };

    const report = computeStudentGrading(marks);
    expect(report.percentage).toBe(33.6);
    expect(report.status).toBe('FAIL');
    expect(report.grade).toBe('F');
  });

  it('marks student as PASS on the exact passing boundaries', () => {
    // 35 * 5 = 175 -> exactly 35%
    const marks: Marks = {
      maths: 35,
      science: 35,
      english: 35,
      social_studies: 35,
      second_language: 35,
    };

    const report = computeStudentGrading(marks);
    expect(report.percentage).toBe(35);
    expect(report.status).toBe('PASS');
    expect(report.grade).toBe('D');
  });
});
