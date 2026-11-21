import React from 'react';
import { ImportSummaryResponse } from '@/app/import/ImportClient';

interface ImportSummaryCardsProps {
  summary: ImportSummaryResponse;
  onReset: () => void;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function ImportSummaryCards({ summary, onReset }: ImportSummaryCardsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Import Summary
          </span>
          <p className="text-xs text-slate-600 mt-0.5">
            File: <span className="font-semibold text-slate-900">{summary.filename}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Import another file
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Rows Read */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-slate-400 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Processed</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
              #
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            {formatNumber(summary.rowsRead)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            rows read from file
          </p>
        </div>

        {/* Card 2: Imported */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Successfully Imported</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">
              ✓
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-emerald-700 mt-2">
            {formatNumber(summary.imported)}
          </p>
          <p className="text-xs font-medium text-emerald-800 mt-1">
            imported{' '}
            <span className="text-emerald-600 font-normal">
              ({formatNumber(summary.newCount)} new, {formatNumber(summary.updatedCount)} updated)
            </span>
          </p>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-white p-5 rounded-xl border border-rose-200 border-l-4 border-l-rose-500 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Validation Failures</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
              !
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-rose-700 mt-2">
            {formatNumber(summary.rejected)}
          </p>
          <p className="text-xs font-medium text-rose-800 mt-1">
            rows rejected with problems
          </p>
        </div>
      </div>
    </div>
  );
}
