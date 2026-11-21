'use client';

import React from 'react';
import Link from 'next/link';
import { StudentGradingReport } from '@/lib/validation/grading';
import { Marks } from '@/lib/validation/types';

export interface StudentReportData {
  student_id: string;
  full_name: string;
  email: string;
  date_of_birth: string | Date;
  date_of_birth_formatted: string;
  grade_level: number;
  section: string;
  marks: Marks;
  grading: StudentGradingReport;
}

interface StudentReportViewProps {
  student: StudentReportData;
}

export function getInitials(name: string): string {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StudentReportView({ student }: StudentReportViewProps) {
  const initials = getInitials(student.full_name);
  const isPass = student.grading.status === 'PASS';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Back button & top bar - hidden in print */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>&lt;</span> Back to students
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
        >
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print report
        </button>
      </div>

      {/* Student Details & Overall Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-0">
        {/* Left 2 cols: Student Information */}
        <div className="md:col-span-2 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xl print:border print:border-slate-300">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {student.full_name}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              <span className="font-mono text-indigo-600">{student.student_id}</span>
              {' | '}
              Class {student.grade_level}, Section {student.section}
            </p>
            <p className="text-xs text-slate-500 mt-1">{student.email}</p>
            {student.date_of_birth_formatted && (
              <p className="text-xs text-slate-500 mt-0.5">
                Date of birth: {student.date_of_birth_formatted}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 col: Overall Result Banner */}
        <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 flex flex-col justify-between print:bg-white print:border-slate-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-indigo-600 mt-0.5">
                {student.grading.percentageDisplay}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Grade
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
                {student.grading.grade}
              </p>
            </div>

            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                  isPass
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {student.grading.status}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Total Score</span>
            <span className="font-mono font-bold text-slate-900">
              {student.grading.total} / {student.grading.maxTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Marks by subject section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border print:border-slate-300 print:shadow-none">
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
            Marks by subject
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {student.grading.subjectResults.map((subj) => (
            <div
              key={subj.subject}
              className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="w-44 font-medium text-slate-900 text-sm">
                {subj.label}
              </div>

              <div className="flex-1 flex items-center gap-4">
                <span className="font-mono text-sm font-semibold text-slate-800 w-12 text-right">
                  {subj.marks}
                </span>

                {/* Visual score bar */}
                <div className="flex-1 max-w-md h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 print:border-slate-300">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      subj.passed
                        ? 'bg-indigo-600 print:bg-slate-800'
                        : 'bg-rose-500 print:bg-slate-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, subj.marks))}%` }}
                  />
                </div>
              </div>

              <div className="w-16 text-right">
                <span
                  className={`text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    subj.passed
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {subj.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}

          {/* Total row */}
          <div className="px-4 sm:px-6 py-4 bg-slate-50/80 flex items-center justify-between font-bold text-sm text-slate-900 border-t-2 border-slate-200">
            <div>Total</div>
            <div className="font-mono text-base text-indigo-700">
              {student.grading.total} / {student.grading.maxTotal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
