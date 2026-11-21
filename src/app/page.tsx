import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Student Results Portal
      </h1>
      <p className="text-slate-600 mb-6 max-w-md">
        Upload student grade sheets, review validation errors, and explore student performance
        reports.
      </p>
      <div className="flex gap-4">
        <Link
          href="/import"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Import Results
        </Link>
        <Link
          href="/students"
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          View Students
        </Link>
      </div>
    </main>
  );
}
