'use client';

import { useRef, useState } from 'react';
import NoteEditor from './NoteEditor';
import { saveNote } from '@/app/notes/[id]/actions';
import type { JSONContent } from '@tiptap/react';

interface EditNoteDialogProps {
  noteId: string;
  initialTitle: string;
  initialContent: JSONContent;
}

export default function EditNoteDialog({
  noteId,
  initialTitle,
  initialContent,
}: EditNoteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<JSONContent>(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [editorKey, setEditorKey] = useState(0);
  const [saving, setSaving] = useState(false);

  function handleOpen() {
    setTitle(initialTitle);
    contentRef.current = initialContent;
    setEditorKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveNote(noteId, title, JSON.stringify(contentRef.current));
      dialogRef.current?.close();
    } catch {
      // keep dialog open on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
      >
        Edit
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Edit note"
        className="w-full max-w-3xl rounded-xl bg-slate-900 border border-white/10 p-0 text-white backdrop:bg-black/60"
      >
        <div className="relative p-6 space-y-4">
          {saving && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 rounded-xl">
              <div className="flex items-center gap-3 text-white/80">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </div>
            </div>
          )}

          <h2 className="text-xl font-bold">Edit Note</h2>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            aria-label="Note title"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <NoteEditor
            key={editorKey}
            initialContent={initialContent}
            onUpdate={(content) => {
              contentRef.current = content;
            }}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
