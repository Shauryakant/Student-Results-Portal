'use client';

import React, { useRef, useState } from 'react';

interface FileDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  disabled?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const REQUIRED_COLUMNS_PREVIEW = [
  'student_id',
  'full_name',
  'email',
  'date_of_birth',
  'grade_level',
  'section',
  'maths',
  'science',
  'english',
  'social_studies',
  'second_language',
];

export function FileDropzone({
  selectedFile,
  onFileSelect,
  onClearFile,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        role="region"
        aria-label="CSV file drop zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-3">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="text-sm font-semibold text-slate-800">
          Drag and drop a CSV file here
        </p>
        <p className="text-xs text-slate-500 my-1.5">or</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={disabled}
          className="rounded-md bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Choose file
        </button>
      </div>

      {/* Selected file preview & specs */}
      <div className="flex flex-col justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Selected File
            </span>
            {selectedFile && (
              <button
                type="button"
                onClick={onClearFile}
                disabled={disabled}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>

          {selectedFile ? (
            <div className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200 mb-4 shadow-2xs">
              <span className="text-2xl">📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-4">
              No file selected yet. Select or drop a CSV file to begin.
            </p>
          )}

          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-600 mb-1.5">
              Required columns (in any order):
            </p>
            <div className="flex flex-wrap gap-1">
              {REQUIRED_COLUMNS_PREVIEW.map((col) => (
                <span
                  key={col}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/70 text-slate-700"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
