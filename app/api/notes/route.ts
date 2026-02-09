import { NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/auth-utils';
import { getNotesByUser, createNote } from '@/lib/notes';
import { createNoteSchema } from '@/lib/validations';

export async function GET() {
  const { session, error } = await getSessionOrUnauthorized();
  if (error) return error;

  try {
    const notes = getNotesByUser(session.user.id);
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { session, error } = await getSessionOrUnauthorized();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = createNoteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const note = createNote(session.user.id, result.data);
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
