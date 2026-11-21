'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const isImportActive = pathname === '/import' || pathname === '/';
  const isStudentsActive = pathname.startsWith('/students');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16">
        <Link
          href="/import"
          className="flex items-center gap-2.5 text-slate-900 font-semibold text-lg hover:text-indigo-600 transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">
            RP
          </span>
          <span>Results Portal</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/import"
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isImportActive
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Import
          </Link>
          <Link
            href="/students"
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isStudentsActive
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Students
          </Link>
        </nav>
      </div>
    </header>
  );
}
