"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "./NoteEditor";
import type { JSONContent } from "@tiptap/react";

export default function NewNoteForm() {
  const router = useRouter();
  const contentRef = useRef<JSONContent | null>(null);

  async function createNote(
    _prev: string | null,
    formData: FormData
  ): Promise<string | null> {
    const title = formData.get("title") as string;
    if (!title.trim()) return "Title is required";
    if (!contentRef.current) return "Note content is required";

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        contentJson: JSON.stringify(contentRef.current),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return data.error ?? "Failed to create note";
    }

    const note = await res.json();
    router.push(`/notes/${note.id}`);
    return null;
  }

  const [error, formAction, isPending] = useActionState(createNote, null);

  return (
    <form action={formAction} className="space-y-6">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-white/80">Title</span>
        <input
          name="title"
          type="text"
          required
          className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          placeholder="Note title"
        />
      </label>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-white/80">Content</span>
        <NoteEditor onUpdate={(content) => (contentRef.current = content)} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Creating..." : "Create Note"}
      </button>
    </form>
  );
}
