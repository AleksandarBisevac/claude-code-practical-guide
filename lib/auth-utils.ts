import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from './auth';

export async function getSessionOrUnauthorized() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }
  return { session, error: null } as const;
}
