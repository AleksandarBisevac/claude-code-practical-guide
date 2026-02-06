import { db } from "./db";
import { nanoid } from "nanoid";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_CONTENT = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string } = {}
): Note {
  const id = nanoid();
  const title = data.title ?? "Untitled note";
  const contentJson = data.contentJson ?? DEFAULT_CONTENT;
  const now = new Date().toISOString();

  db.query(
    `INSERT INTO notes (id, user_id, title, content_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, userId, title, contentJson, now, now);

  return {
    id,
    userId,
    title,
    contentJson,
    isPublic: false,
    publicSlug: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = db
    .query("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(noteId, userId) as NoteRow | undefined;

  return row ? rowToNote(row) : null;
}

export function getNotesByUser(userId: string): Note[] {
  const rows = db
    .query("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId) as NoteRow[];

  return rows.map(rowToNote);
}

export function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>
): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const contentJson = data.contentJson ?? existing.contentJson;
  const now = new Date().toISOString();

  db.query(
    `UPDATE notes SET title = ?, content_json = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(title, contentJson, now, noteId, userId);

  return { ...existing, title, contentJson, updatedAt: now };
}

export function deleteNote(userId: string, noteId: string): boolean {
  const result = db
    .query("DELETE FROM notes WHERE id = ? AND user_id = ?")
    .run(noteId, userId);
  return result.changes > 0;
}

export function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean
): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;

  const now = new Date().toISOString();
  let publicSlug = existing.publicSlug;

  if (isPublic && !publicSlug) {
    publicSlug = nanoid(16);
  } else if (!isPublic) {
    publicSlug = null;
  }

  db.query(
    `UPDATE notes SET is_public = ?, public_slug = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(isPublic ? 1 : 0, publicSlug, now, noteId, userId);

  return {
    ...existing,
    isPublic,
    publicSlug,
    updatedAt: now,
  };
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = db
    .query("SELECT * FROM notes WHERE public_slug = ? AND is_public = 1")
    .get(slug) as NoteRow | undefined;

  return row ? rowToNote(row) : null;
}
