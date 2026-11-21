import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function generatePageNumbers(
  current: number,
  total: number,
): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Pagination({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ring-1 ring-inset ring-slate-300"
        >
          &lt; Previous
        </button>

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-200'
                }`}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ) : (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-xs text-slate-400 select-none"
              >
                ...
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors ring-1 ring-inset ring-slate-300"
        >
          Next &gt;
        </button>
      </div>

      {/* Rows per page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="rows-select" className="text-xs text-slate-500 whitespace-nowrap">
          Rows per page
        </label>
        <select
          id="rows-select"
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          className="rounded-lg border border-slate-300 bg-white py-1.5 pl-2 pr-7 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
