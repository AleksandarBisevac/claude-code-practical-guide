'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { updateNote, deleteNote } from '@/lib/notes';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateNoteSchema } from '@/lib/validations';

export async function saveNote(noteId: string, title: string, contentJson: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const result = updateNoteSchema.safeParse({ title, contentJson });
  if (!result.success) throw new Error('Validation failed');

  const note = updateNote(session.user.id, noteId, result.data);
  if (!note) throw new Error('Not found');

  revalidatePath(`/notes/${noteId}`);
  return note;
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  const deleted = deleteNote(session.user.id, noteId);
  if (!deleted) throw new Error('Not found');

  redirect('/dashboard');
}
