import { NextResponse } from 'next/server';
import { getSessionOrUnauthorized } from '@/lib/auth-utils';
import { setNotePublic } from '@/lib/notes';
import { shareNoteSchema } from '@/lib/validations';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { session, error } = await getSessionOrUnauthorized();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = shareNoteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const note = setNotePublic(session.user.id, id, result.data.isPublic);
    if (!note) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 });
  }
}
