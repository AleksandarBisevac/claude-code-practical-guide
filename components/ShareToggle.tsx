'use client';

import { useState } from 'react';

interface ShareToggleProps {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
}

export default function ShareToggle({ noteId, initialIsPublic, initialSlug }: ShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) throw new Error('Failed to update sharing');
      const note = await res.json();
      setIsPublic(note.isPublic);
      setSlug(note.publicSlug);
    } catch {
      // revert on error
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!slug) return;
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isPublic}
        aria-label="Toggle public sharing"
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
          isPublic ? 'bg-purple-600' : 'bg-white/20'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isPublic ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm text-white/60">{isPublic ? 'Public' : 'Private'}</span>
      {isPublic && slug && (
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      )}
    </div>
  );
}
