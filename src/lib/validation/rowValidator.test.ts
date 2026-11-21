import { describe, it, expect } from 'vitest';
import { validateRow } from './rowValidator';

describe('validateRow', () => {
  const fixedToday = new Date(Date.UTC(2024, 10, 15));

  const validRow = {
    student_id: 'stu00001',
    full_name: '   Yash   Fernandes  ',
    email: 'YASH.FERNANDES30@EXAMPLE.EDU',
    date_of_birth: '27/12/2008',
    grade_level: '12',
    section: 'a',
    maths: '39',
    science: '69.6',
    english: '62',
    social_studies: '72',
    second_language: '55',
  };

  it('validates a correct row, normalizes fields, and calculates total and percentage', () => {
    const result = validateRow(validRow, fixedToday);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.student_id).toBe('STU00001');
      expect(result.value.full_name).toBe('Yash Fernandes');
      expect(result.value.name_search).toBe('yash fernandes');
      expect(result.value.email).toBe('yash.fernandes30@example.edu');
      expect(result.value.section).toBe('A');
      expect(result.value.grade_level).toBe(12);
      expect(result.value.total).toBe(297.6);
      expect(result.value.percentage).toBeCloseTo(59.52, 2);
    }
  });

  it('handles case-insensitive and padded column names in raw input', () => {
    const paddedRow = {
      ' STUDENT_ID ': 'STU00002',
      'Full_Name ': 'Mihir Menon',
      ' EMAIL': 'mihir.menon10@example.edu',
      'Date_Of_Birth': '2013-03-28',
      'grade_level ': '7',
      'Section': 'A',
      'maths': '58',
      'SCIENCE ': '64',
      'english': '58.0',
      'social_studies': '59.5',
      'second_language': '60',
    };

    const result = validateRow(paddedRow, fixedToday);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.student_id).toBe('STU00002');
    }
  });

  it('collects ALL errors when multiple fields are invalid', () => {
    const badRow = {
      student_id: '!!', // INVALID_FORMAT
      full_name: '', // MISSING_REQUIRED
      email: 'bademail', // INVALID_FORMAT
      date_of_birth: '1970-01-01', // OUT_OF_RANGE
      grade_level: 'IX', // INVALID_FORMAT
      section: 'Z', // INVALID_FORMAT
      maths: '-5', // OUT_OF_RANGE
      science: '105', // OUT_OF_RANGE
      english: 'abc', // INVALID_FORMAT
      social_studies: '', // MISSING_REQUIRED
      second_language: '50', // valid
    };

    const result = validateRow(badRow, fixedToday);
    expect(result.success).toBe(false);
    if (!result.success) {
      // 10 errors across 10 bad fields
      expect(result.errors).toHaveLength(10);
      const fields = result.errors.map((e) => e.field);
      expect(fields).toContain('student_id');
      expect(fields).toContain('full_name');
      expect(fields).toContain('email');
      expect(fields).toContain('date_of_birth');
      expect(fields).toContain('grade_level');
      expect(fields).toContain('section');
      expect(fields).toContain('maths');
      expect(fields).toContain('science');
      expect(fields).toContain('english');
      expect(fields).toContain('social_studies');
    }
  });

  it('captures raw studentId even when validation fails for problem reporting', () => {
    const row = {
      student_id: 'STU00005',
      full_name: 'Aditya Deshmukh',
      email: 'aditya.deshmukh69@example.edu',
      date_of_birth: '2011-02-25',
      grade_level: '10',
      section: 'A',
      maths: '-5', // bad maths
      science: '52.2',
      english: '65',
      social_studies: '68',
      second_language: '58',
    };

    const result = validateRow(row, fixedToday);
    expect(result.success).toBe(false);
    expect(result.studentIdRaw).toBe('STU00005');
  });
});
