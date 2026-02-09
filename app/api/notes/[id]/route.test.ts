import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = { user: { id: 'u1', name: 'Test', email: 't@t.com' } };

vi.mock('@/lib/auth-utils', () => ({
  getSessionOrUnauthorized: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: { query: vi.fn().mockReturnValue({ run: vi.fn(), get: vi.fn(), all: vi.fn() }) },
}));

import { GET, PUT, DELETE } from './route';
import { getSessionOrUnauthorized } from '@/lib/auth-utils';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';

const mockGetSession = vi.mocked(getSessionOrUnauthorized);
const mockGetNoteById = vi.mocked(getNoteById);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

const params = Promise.resolve({ id: 'n1' });

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/notes/n1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockGetSession.mockResolvedValue({ session: mockSession as any, error: null });
});

describe('GET /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockGetNoteById.mockReturnValueOnce(null);
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 200 with note', async () => {
    const note = { id: 'n1', title: 'Test' };
    mockGetNoteById.mockReturnValueOnce(note as any);
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('n1');
  });
});

describe('PUT /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await PUT(jsonRequest({ title: 'X' }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/notes/n1', {
      method: 'PUT',
      body: 'not json',
    });
    const res = await PUT(req, { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 for validation failure', async () => {
    const res = await PUT(jsonRequest({ title: '' }), { params });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('returns 404 when note not found', async () => {
    mockUpdateNote.mockReturnValueOnce(null);
    const res = await PUT(jsonRequest({ title: 'Updated' }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 200 on success', async () => {
    const note = { id: 'n1', title: 'Updated' };
    mockUpdateNote.mockReturnValueOnce(note as any);
    const res = await PUT(jsonRequest({ title: 'Updated' }), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Updated');
  });
});

describe('DELETE /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
    mockGetSession.mockResolvedValueOnce({ session: null, error: errorResponse } as any);
    const res = await DELETE(new Request('http://localhost'), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    mockDeleteNote.mockReturnValueOnce(false);
    const res = await DELETE(new Request('http://localhost'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 200 on success', async () => {
    mockDeleteNote.mockReturnValueOnce(true);
    const res = await DELETE(new Request('http://localhost'), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('passes correct user_id and note_id', async () => {
    mockDeleteNote.mockReturnValueOnce(true);
    await DELETE(new Request('http://localhost'), { params });
    expect(mockDeleteNote).toHaveBeenCalledWith('u1', 'n1');
  });
});
