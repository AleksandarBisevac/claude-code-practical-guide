'use client';

import Link from 'next/link';

export default function NoteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Failed to load note</h2>
        <p className="text-white/60">Something went wrong while loading this note.</p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
