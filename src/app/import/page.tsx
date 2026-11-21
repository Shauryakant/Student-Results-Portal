import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import Results | Student Results Portal',
  description: 'Upload and import student term results CSV files',
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Import student results
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a CSV exported from your spreadsheet. Valid rows are imported; problem rows are listed below.
        </p>
      </div>

      <div id="import-container" className="space-y-6">
        {/* Dropzone & components will be mounted here */}
      </div>
    </div>
  );
}
