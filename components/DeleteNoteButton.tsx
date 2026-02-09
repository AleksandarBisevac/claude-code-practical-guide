'use client';

import { useState } from 'react';
import { deleteNoteAction } from '@/app/notes/[id]/actions';

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteNoteAction(noteId);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/60">Delete this note?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
        >
          {deleting ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
    >
      Delete
    </button>
  );
}
