'use client';

import React, { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { ProblemReport } from '@/lib/validation/types';

export interface ImportSummaryResponse {
  success: boolean;
  importId: string;
  filename: string;
  rowsRead: number;
  imported: number;
  newCount: number;
  updatedCount: number;
  rejected: number;
  problemsCount: number;
  problems: ProblemReport[];
  hasMoreProblems: boolean;
  startedAt: string;
  finishedAt: string;
}

interface ImportClientProps {
  children?: React.ReactNode;
  renderResults?: (summary: ImportSummaryResponse, onReset: () => void) => React.ReactNode;
}

export function ImportClient({ renderResults }: ImportClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummaryResponse | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSummary(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import CSV file');
      }

      setSummary(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'A network error occurred while uploading. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold">Upload failed</h3>
              <p className="text-sm mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissError}
            className="text-rose-500 hover:text-rose-700 text-sm font-semibold p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* File Dropzone & Upload Button */}
      {!summary && (
        <div className="space-y-4">
          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
            disabled={isUploading}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                !selectedFile || isUploading
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
              }`}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading and importing...
                </>
              ) : (
                'Upload and import'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results slot */}
      {summary && renderResults && renderResults(summary, handleReset)}
    </div>
  );
}
