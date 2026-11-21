'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StudentTable, StudentListItem } from '@/components/StudentTable';
import { StudentFilters } from '@/components/StudentFilters';
import { Pagination } from '@/components/Pagination';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function StudentsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = parseInt(searchParams.get('limit') || '25', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentGrade = searchParams.get('grade') || 'all';

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === '' || (key === 'grade' && val === 'all')) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearchChange = (newSearch: string) => {
    updateUrlParams({ search: newSearch, page: '1' });
  };

  const handleGradeChange = (newGrade: string) => {
    updateUrlParams({ grade: newGrade, page: '1' });
  };

  const handleClearSearch = () => {
    updateUrlParams({ search: '', page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: String(newPage) });
  };

  const handleLimitChange = (newLimit: number) => {
    updateUrlParams({ limit: String(newLimit), page: '1' });
  };

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentPage) params.set('page', String(currentPage));
      if (currentLimit) params.set('limit', String(currentLimit));
      if (currentSearch) params.set('search', currentSearch);
      if (currentGrade && currentGrade !== 'all') params.set('grade', currentGrade);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load students');

      const data = await res.json();
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching students');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentLimit, currentSearch, currentGrade]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Students
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Showing {pagination.total > 0 ? (currentPage - 1) * currentLimit + 1 : 0} to{' '}
            {Math.min(currentPage * currentLimit, pagination.total)} of{' '}
            {pagination.total.toLocaleString()} students
          </p>
        </div>
      </div>

      <StudentFilters
        search={currentSearch}
        grade={currentGrade}
        onSearchChange={handleSearchChange}
        onGradeChange={handleGradeChange}
        onClearSearch={handleClearSearch}
      />

      {/* Table & states */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center gap-8">
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-5 w-8 bg-slate-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-xl border border-rose-200">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-base font-semibold text-rose-900 mt-2">
            Failed to load students
          </h3>
          <p className="text-sm text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchStudents}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-3 text-xl">
            🔍
          </div>
          {currentSearch ? (
            <>
              <h3 className="text-base font-semibold text-slate-900">
                No students match &ldquo;{currentSearch}&rdquo;
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No students were found matching your search. Check the spelling or clear the filter to see all students.
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Clear search
              </button>
            </>
          ) : currentGrade !== 'all' ? (
            <>
              <h3 className="text-base font-semibold text-slate-900">
                No students in Class {currentGrade}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                There are no students recorded for this class level.
              </p>
              <button
                type="button"
                onClick={() => handleGradeChange('all')}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Show all classes
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-slate-900">
                No students found
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No student results have been imported into the portal yet.
              </p>
              <a
                href="/import"
                className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Go to Import
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          <StudentTable students={students} />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </>
      )}
    </div>
  );
}
