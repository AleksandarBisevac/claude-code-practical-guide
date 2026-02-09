import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = { user: { id: 'u1', name: 'Test', email: 't@t.com' } };

vi.mock('@/lib/auth-utils', () => ({
  getSessionOrUnauthorized: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  setNotePublic: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: { query: vi.fn().mockReturnValue({ run: vi.fn(), get: vi.fn(), all: vi.fn() }) },
}));

import { POST } from './route';
import { getSessionOrUnauthorized } from '@/lib/auth-utils';
import { setNotePublic } from '@/lib/notes';

const mockGetSession = vi.mocked(getSessionOrUnauthorized);
const mockSetNotePublic = vi.mocked(setNotePublic);

const params = Promise.resolve({ id: 'n1' });

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/notes/n1/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockGetSession.mockResolvedValue({ session: mockSession as any, error: null });
});

describe('POST /api/notes/[id]/share', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await POST(jsonRequest({ isPublic: true }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: 'bad' });
    const res = await POST(req, { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-boolean isPublic', async () => {
    const res = await POST(jsonRequest({ isPublic: 'yes' }), { params });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('returns 404 when note not found', async () => {
    mockSetNotePublic.mockReturnValueOnce(null);
    const res = await POST(jsonRequest({ isPublic: true }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 200 when enabling sharing', async () => {
    const note = { id: 'n1', isPublic: true, publicSlug: 'slug123' };
    mockSetNotePublic.mockReturnValueOnce(note as any);
    const res = await POST(jsonRequest({ isPublic: true }), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPublic).toBe(true);
  });

  it('returns 200 when disabling sharing', async () => {
    const note = { id: 'n1', isPublic: false, publicSlug: null };
    mockSetNotePublic.mockReturnValueOnce(note as any);
    const res = await POST(jsonRequest({ isPublic: false }), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPublic).toBe(false);
  });

  it('returns 500 on internal error', async () => {
    mockSetNotePublic.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await POST(jsonRequest({ isPublic: true }), { params });
    expect(res.status).toBe(500);
  });
});
