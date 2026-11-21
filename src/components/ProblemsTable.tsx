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

export function ProblemsTable({
  importId,
  problems,
  totalProblemsCount,
}: ProblemsTableProps) {
  if (totalProblemsCount === 0) {
    return (
      <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
        <span className="text-3xl">🎉</span>
        <h3 className="text-base font-semibold text-emerald-900 mt-2">
          Perfect Import!
        </h3>
        <p className="text-sm text-emerald-700 mt-1">
          All student rows were validated and imported with zero errors.
        </p>
      </div>
    );
  }

  const downloadUrl = `/api/imports/${importId}/errors.csv`;
  const isTruncated = totalProblemsCount > problems.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Row problems
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTruncated
              ? `Showing first ${problems.length} of ${totalProblemsCount} problems`
              : `Showing all ${problems.length} problems`}
          </p>
        </div>

        <a
          href={downloadUrl}
          download
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
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
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 w-20">
                Row
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 w-36">
                Student ID
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 w-40">
                Field
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3">
                Problem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {problems.map((prob, index) => (
              <tr
                key={`${prob.row}-${prob.field}-${index}`}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 sm:px-6 py-3 font-mono text-xs text-slate-500">
                  {prob.row}
                </td>
                <td className="px-4 sm:px-6 py-3 font-mono text-xs font-medium text-slate-900">
                  {prob.student_id || '(blank)'}
                </td>
                <td className="px-4 sm:px-6 py-3 text-xs font-medium text-slate-700">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800">
                    {prob.field}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 text-xs text-slate-800">
                  {formatProblemMessage(prob)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
