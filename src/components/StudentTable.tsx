import React from 'react';
import Link from 'next/link';

export interface StudentListItem {
  student_id: string;
  full_name: string;
  grade_level: number;
  section: string;
  total: number;
  percentage: number;
  percentage_display: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface StudentTableProps {
  students: StudentListItem[];
}

export function getGradeBadgeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/30';
    case 'B':
      return 'bg-blue-50 text-blue-700 ring-blue-600/30';
    case 'C':
      return 'bg-amber-50 text-amber-700 ring-amber-600/30';
    case 'D':
      return 'bg-orange-50 text-orange-700 ring-orange-600/30';
    case 'F':
    default:
      return 'bg-rose-50 text-rose-700 ring-rose-600/30';
  }
}

export function StudentTable({ students }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-36">
                Student ID
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Full Name
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-24 text-center">
                Class
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-24 text-center">
                Section
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-28 text-right">
                Percentage
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-24 text-center">
                Grade
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-20 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr
                key={student.student_id}
                className="hover:bg-indigo-50/40 transition-colors group"
              >
                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs font-semibold text-indigo-600">
                  <Link
                    href={`/students/${student.student_id}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    {student.student_id}
                  </Link>
                </td>
                <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                  <Link
                    href={`/students/${student.student_id}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {student.full_name}
                  </Link>
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center text-slate-700 font-medium">
                  Class {student.grade_level}
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-mono text-xs font-semibold text-slate-700">
                    {student.section}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-right font-mono font-semibold text-slate-900">
                  {student.percentage_display}
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getGradeBadgeColor(
                      student.grade,
                    )}`}
                  >
                    {student.grade}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center">
                  <Link
                    href={`/students/${student.student_id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
