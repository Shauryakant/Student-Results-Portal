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

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading students...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          {error}
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
