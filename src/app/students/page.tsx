import { Metadata } from 'next';
import { Suspense } from 'react';
import { StudentsClient } from './StudentsClient';

export const metadata: Metadata = {
  title: 'Students | Student Results Portal',
  description: 'Search, filter, and view student term results',
};

export default function StudentsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading students...</div>}>
        <StudentsClient />
      </Suspense>
    </main>
  );
}
