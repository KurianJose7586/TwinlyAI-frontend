"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-white">
      <div className="text-center space-y-6 p-8 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Chat error</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Something went wrong loading this conversation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/recruiter"
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Back to candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
