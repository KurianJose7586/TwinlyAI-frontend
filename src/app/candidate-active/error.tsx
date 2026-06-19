"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Candidate dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111318] text-slate-900 dark:text-white">
      <div className="text-center space-y-6 p-8 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard error</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Something went wrong loading your AI Twin dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/candidate-active"
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Reload
          </Link>
        </div>
      </div>
    </div>
  );
}
