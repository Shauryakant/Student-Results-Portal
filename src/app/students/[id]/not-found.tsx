import Link from 'next/link';

export default function StudentNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Student not found
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
        We couldn&apos;t find a student record matching this ID. The student may not have been imported yet, or the ID may be typed incorrectly.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
        >
          <span>&larr;</span> Back to Students
        </Link>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
        >
          Upload CSV
        </Link>
      </div>
    </div>
  );
}
