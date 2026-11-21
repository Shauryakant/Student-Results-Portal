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
          className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
        >
          Import another file
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Rows Read */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {formatNumber(summary.rowsRead)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            rows read
          </p>
        </div>

        {/* Card 2: Imported */}
        <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-200/80 shadow-2xs">
          <p className="text-3xl font-bold tracking-tight text-emerald-700">
            {formatNumber(summary.imported)}
          </p>
          <p className="text-xs font-medium text-emerald-800 mt-1">
            imported{' '}
            <span className="text-emerald-700/80 font-normal">
              ({formatNumber(summary.newCount)} new, {formatNumber(summary.updatedCount)} updated)
            </span>
          </p>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-rose-50/40 p-5 rounded-xl border border-rose-200/80 shadow-2xs">
          <p className="text-3xl font-bold tracking-tight text-rose-700">
            {formatNumber(summary.rejected)}
          </p>
          <p className="text-xs font-medium text-rose-800 mt-1">
            rows rejected
          </p>
        </div>
      </div>
    </div>
  );
}
