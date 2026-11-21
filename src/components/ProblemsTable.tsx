import React from 'react';
import { ProblemReport } from '@/lib/validation/types';

interface ProblemsTableProps {
  importId: string;
  problems: ProblemReport[];
  totalProblemsCount: number;
}

export function formatProblemMessage(problem: ProblemReport): string {
  // If problem.message already contains the code, return as is
  if (problem.message.includes(problem.code)) {
    return problem.message;
  }
  return `${problem.message} (${problem.code})`;
}

export function getProblemBadgeColor(code: string): string {
  switch (code) {
    case 'DUPLICATE_ID':
      return 'bg-amber-50 text-amber-700 ring-amber-600/30';
    case 'WRONG_FIELD_COUNT':
      return 'bg-rose-50 text-rose-700 ring-rose-600/30';
    case 'OUT_OF_RANGE':
      return 'bg-orange-50 text-orange-700 ring-orange-600/30';
    case 'INVALID_FORMAT':
      return 'bg-purple-50 text-purple-700 ring-purple-600/30';
    case 'MISSING_REQUIRED':
    default:
      return 'bg-red-50 text-red-700 ring-red-600/30';
  }
}

export function ProblemsTable({
  importId,
  problems,
  totalProblemsCount,
}: ProblemsTableProps) {
  if (totalProblemsCount === 0) {
    return (
      <div className="p-8 bg-gradient-to-b from-emerald-50/80 to-white rounded-xl border border-emerald-200 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl font-bold mb-2">
          ✓
        </div>
        <h3 className="text-base font-bold text-emerald-950">
          Perfect Import!
        </h3>
        <p className="text-sm text-emerald-700 mt-1 max-w-sm mx-auto">
          All student rows were successfully validated and saved to the database with zero errors.
        </p>
      </div>
    );
  }

  const downloadUrl = `/api/imports/${importId}/errors.csv`;
  const isTruncated = totalProblemsCount > problems.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 border-b border-slate-200 gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Row Problems
            </h2>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
              {totalProblemsCount} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTruncated
              ? `Displaying first ${problems.length} problems. Download CSV for the full report.`
              : `Displaying all ${problems.length} problems.`}
          </p>
        </div>

        <a
          href={downloadUrl}
          download
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
        >
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download error report (CSV)
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 w-20">
                Line
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 w-36">
                Student ID
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 w-36">
                Field
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 w-36">
                Error Code
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3">
                Problem Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {problems.map((prob, index) => (
              <tr
                key={`${prob.row}-${prob.field}-${index}`}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 sm:px-6 py-3 font-mono text-xs text-slate-500">
                  {prob.row}
                </td>
                <td className="px-4 sm:px-6 py-3 font-mono text-xs font-semibold text-slate-900">
                  {prob.student_id || '(blank)'}
                </td>
                <td className="px-4 sm:px-6 py-3 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">
                    {prob.field}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 text-xs">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getProblemBadgeColor(
                      prob.code,
                    )}`}
                  >
                    {prob.code}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 text-xs text-slate-700">
                  {prob.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
