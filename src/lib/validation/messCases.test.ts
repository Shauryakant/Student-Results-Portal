import { describe, it, expect } from 'vitest';
import { validateRow } from './rowValidator';

describe('Real-world Messy Data Cases from students_small.csv & students_sample.csv', () => {
  const referenceToday = new Date(Date.UTC(2024, 10, 15));

  const baseValid = {
    student_id: 'STU00001',
    full_name: 'Yash Fernandes',
    email: 'yash.fernandes30@example.edu',
    date_of_birth: '2008-12-27',
    grade_level: '12',
    section: 'A',
    maths: '80',
    science: '75',
    english: '70',
    social_studies: '85',
    second_language: '90',
  };

  it('1. ID case normalization: lowercase stu00022 -> uppercase STU00022', () => {
    const res = validateRow({ ...baseValid, student_id: 'stu00022' }, referenceToday);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.student_id).toBe('STU00022');
    }
  });

  it('2. ID surrounding whitespace: trimmed properly', () => {
    const res = validateRow({ ...baseValid, student_id: '  STU00045  ' }, referenceToday);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.student_id).toBe('STU00045');
    }
  });

  it('3. Name whitespace: collapses multiple inner spaces and trims edges', () => {
    const res = validateRow(
      { ...baseValid, full_name: '   Siddharth     Bose   ' },
      referenceToday,
    );
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.full_name).toBe('Siddharth Bose');
      expect(res.value.name_search).toBe('siddharth bose');
    }
  });

  it('4. Name with Unicode characters (Müller Patel, Amélie Rao, Noël Thomas)', () => {
    const unicodeNames = ['Müller Patel', 'Amélie Rao', 'Noël Thomas'];
    for (const name of unicodeNames) {
      const res = validateRow({ ...baseValid, full_name: name }, referenceToday);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.value.full_name).toBe(name);
      }
    }
  });

  it('5. Name with quotes and commas (e.g. "Patel, Sahil")', () => {
    const res = validateRow({ ...baseValid, full_name: 'Patel, Sahil' }, referenceToday);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.full_name).toBe('Patel, Sahil');
    }
  });

  it('6. Name missing/empty: reports MISSING_REQUIRED', () => {
    const res = validateRow({ ...baseValid, full_name: '   ' }, referenceToday);
    expect(res.success).toBe(false);
    expect(res.errors[0]).toMatchObject({
      field: 'full_name',
      code: 'MISSING_REQUIRED',
    });
  });

  it('7. Email case and whitespace: converts uppercase ADITYA.PAWAR82@EXAMPLE.EDU to lowercase and trims', () => {
    const res = validateRow(
      { ...baseValid, email: '   ADITYA.PAWAR82@EXAMPLE.EDU   ' },
      referenceToday,
    );
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.email).toBe('aditya.pawar82@example.edu');
    }
  });

  it('8. Email invalid format without TLD (sana@example): reports INVALID_FORMAT', () => {
    const res = validateRow({ ...baseValid, email: 'sana@example' }, referenceToday);
    expect(res.success).toBe(false);
    expect(res.errors[0]).toMatchObject({
      field: 'email',
      code: 'INVALID_FORMAT',
    });
  });

  it('9. DOB format: supports both DD/MM/YYYY and YYYY-MM-DD', () => {
    const res1 = validateRow({ ...baseValid, date_of_birth: '27/12/2008' }, referenceToday);
    expect(res1.success).toBe(true);
    const res2 = validateRow({ ...baseValid, date_of_birth: '2008-12-27' }, referenceToday);
    expect(res2.success).toBe(true);
  });

  it('10. DOB invalid format: text string ("tomorrow") or email in DOB column', () => {
    const res1 = validateRow({ ...baseValid, date_of_birth: 'tomorrow' }, referenceToday);
    expect(res1.success).toBe(false);
    expect(res1.errors[0].code).toBe('INVALID_FORMAT');

    const res2 = validateRow(
      { ...baseValid, date_of_birth: 'rohan.kaur85@example.edu' },
      referenceToday,
    );
    expect(res2.success).toBe(false);
    expect(res2.errors[0].code).toBe('INVALID_FORMAT');
  });

  it('11. DOB out of range: age > 25 (1970-01-01) or future date (2031-05-01)', () => {
    const resOld = validateRow({ ...baseValid, date_of_birth: '1970-01-01' }, referenceToday);
    expect(resOld.success).toBe(false);
    expect(resOld.errors[0].code).toBe('OUT_OF_RANGE');

    const resFuture = validateRow({ ...baseValid, date_of_birth: '2031-05-01' }, referenceToday);
    expect(resFuture.success).toBe(false);
    expect(resFuture.errors[0].code).toBe('OUT_OF_RANGE');
  });

  it('12. Grade level leading zero: "09" and "01" parsed to numbers 9 and 1', () => {
    const res9 = validateRow({ ...baseValid, grade_level: '09' }, referenceToday);
    expect(res9.success).toBe(true);
    if (res9.success) expect(res9.value.grade_level).toBe(9);

    const res1 = validateRow({ ...baseValid, grade_level: '01' }, referenceToday);
    expect(res1.success).toBe(true);
    if (res1.success) expect(res1.value.grade_level).toBe(1);
  });

  it('13. Grade level roman numeral ("IX"): reports INVALID_FORMAT', () => {
    const res = validateRow({ ...baseValid, grade_level: 'IX' }, referenceToday);
    expect(res.success).toBe(false);
    expect(res.errors[0]).toMatchObject({
      field: 'grade_level',
      code: 'INVALID_FORMAT',
    });
  });

  it('14. Section case normalization: lowercase "a" -> uppercase "A"', () => {
    const res = validateRow({ ...baseValid, section: 'a' }, referenceToday);
    expect(res.success).toBe(true);
    if (res.success) expect(res.value.section).toBe('A');
  });

  it('15. Section invalid ("Z"): reports INVALID_FORMAT', () => {
    const res = validateRow({ ...baseValid, section: 'Z' }, referenceToday);
    expect(res.success).toBe(false);
    expect(res.errors[0]).toMatchObject({
      field: 'section',
      code: 'INVALID_FORMAT',
    });
  });

  it('16. Marks decimals and padding: parsed accurately', () => {
    const res = validateRow(
      {
        ...baseValid,
        maths: '  41.2  ',
        science: '51.1',
        english: '57.0',
        social_studies: '52.4',
        second_language: '39',
      },
      referenceToday,
    );
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.value.marks.maths).toBe(41.2);
      expect(res.value.marks.science).toBe(51.1);
      expect(res.value.marks.english).toBe(57);
      expect(res.value.total).toBeCloseTo(240.7, 1);
    }
  });

  it('17. Marks negative (-5) and above 100 (105, 1e3): reports OUT_OF_RANGE', () => {
    const resNeg = validateRow({ ...baseValid, maths: '-5' }, referenceToday);
    expect(resNeg.success).toBe(false);
    expect(resNeg.errors[0].code).toBe('OUT_OF_RANGE');

    const resAbove = validateRow({ ...baseValid, science: '105' }, referenceToday);
    expect(resAbove.success).toBe(false);
    expect(resAbove.errors[0].code).toBe('OUT_OF_RANGE');

    const resSci = validateRow({ ...baseValid, english: '1e3' }, referenceToday);
    expect(resSci.success).toBe(false);
    expect(resSci.errors[0].code).toBe('OUT_OF_RANGE');
  });

  it('18. Marks empty: reports MISSING_REQUIRED', () => {
    const res = validateRow({ ...baseValid, science: '' }, referenceToday);
    expect(res.success).toBe(false);
    expect(res.errors[0]).toMatchObject({
      field: 'science',
      code: 'MISSING_REQUIRED',
    });
  });
});
