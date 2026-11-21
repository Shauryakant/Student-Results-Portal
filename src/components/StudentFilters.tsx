'use client';

import React, { useState, useEffect } from 'react';

interface StudentFiltersProps {
  search: string;
  grade: string;
  onSearchChange: (search: string) => void;
  onGradeChange: (grade: string) => void;
  onClearSearch: () => void;
}

export function StudentFilters({
  search,
  grade,
  onSearchChange,
  onGradeChange,
  onClearSearch,
}: StudentFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync internal state if external search prop changes (e.g., from URL or Clear)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search update (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleClear = () => {
    setLocalSearch('');
    onClearSearch();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name or student ID"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          aria-label="Search students by name or ID"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            aria-label="Clear search text"
          >
            ✕
          </button>
        )}
      </div>

      {/* Class / Grade Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="grade-select" className="sr-only">
          Filter by Class
        </label>
        <select
          id="grade-select"
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
        >
          <option value="all">All classes</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={String(g)}>
              Class {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
