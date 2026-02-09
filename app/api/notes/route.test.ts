import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = { user: { id: 'u1', name: 'Test', email: 't@t.com' } };

vi.mock('@/lib/auth-utils', () => ({
  getSessionOrUnauthorized: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  getNotesByUser: vi.fn(),
  createNote: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: { query: vi.fn().mockReturnValue({ run: vi.fn(), get: vi.fn(), all: vi.fn() }) },
}));

import { GET, POST } from './route';
import { getSessionOrUnauthorized } from '@/lib/auth-utils';
import { getNotesByUser, createNote } from '@/lib/notes';

const mockGetSession = vi.mocked(getSessionOrUnauthorized);
const mockGetNotesByUser = vi.mocked(getNotesByUser);
const mockCreateNote = vi.mocked(createNote);

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function invalidJsonRequest(): Request {
  return new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not json',
  });
}

beforeEach(() => {
  mockGetSession.mockResolvedValue({ session: mockSession as any, error: null });
});

describe('GET /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with notes', async () => {
    const notes = [{ id: 'n1', title: 'Test' }];
    mockGetNotesByUser.mockReturnValueOnce(notes as any);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(notes);
  });

  it('returns 500 on error', async () => {
    mockGetNotesByUser.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await POST(jsonRequest({ title: 'T' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(invalidJsonRequest());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid JSON body');
  });

  it('returns 400 for validation failure', async () => {
    const res = await POST(jsonRequest({ title: '' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('returns 201 on success', async () => {
    const note = { id: 'n1', title: 'New', userId: 'u1' };
    mockCreateNote.mockReturnValueOnce(note as any);
    const res = await POST(jsonRequest({ title: 'New' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('n1');
  });

  it('returns 500 on create error', async () => {
    mockCreateNote.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await POST(jsonRequest({ title: 'New' }));
    expect(res.status).toBe(500);
  });

  it('passes session user id to createNote', async () => {
    mockCreateNote.mockReturnValueOnce({ id: 'n1' } as any);
    await POST(jsonRequest({ title: 'New' }));
    expect(mockCreateNote).toHaveBeenCalledWith('u1', { title: 'New' });
  });

  it('accepts empty body (all optional fields)', async () => {
    mockCreateNote.mockReturnValueOnce({ id: 'n1' } as any);
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(201);
  });
});
