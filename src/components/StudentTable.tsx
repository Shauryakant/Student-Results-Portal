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
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'B':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    case 'C':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'D':
      return 'bg-orange-50 text-orange-700 ring-orange-600/20';
    case 'F':
    default:
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
  }
}

export function StudentTable({ students }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3.5 w-32">
                Student ID
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">
                Name
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr
                key={student.student_id}
                className="hover:bg-indigo-50/40 transition-colors group"
              >
                <td className="px-4 sm:px-6 py-3.5 font-mono text-xs font-semibold text-indigo-600">
                  <Link
                    href={`/students/${student.student_id}`}
                    className="hover:underline flex items-center gap-1"
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
                <td className="px-4 sm:px-6 py-3.5 text-center text-slate-700">
                  {student.grade_level}
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center text-slate-700 font-medium">
                  {student.section}
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-right font-mono text-slate-900">
                  {student.percentage_display}
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getGradeBadgeColor(
                      student.grade,
                    )}`}
                  >
                    {student.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
