import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = { user: { id: 'u1', name: 'Test', email: 't@t.com' } };

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/notes', () => ({
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

class RedirectError extends Error {
  digest: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.digest = `NEXT_REDIRECT;replace;${url}`;
  }
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new RedirectError(url);
  }),
}));

vi.mock('@/lib/db', () => ({
  db: { query: vi.fn().mockReturnValue({ run: vi.fn(), get: vi.fn(), all: vi.fn() }) },
}));

import { saveNote, deleteNoteAction } from './actions';
import { auth } from '@/lib/auth';
import { updateNote, deleteNote } from '@/lib/notes';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

beforeEach(() => {
  mockGetSession.mockResolvedValue(mockSession as any);
  mockRedirect.mockImplementation((url: string) => {
    throw new RedirectError(url);
  });
});

describe('saveNote', () => {
  it('throws Unauthorized when no session', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    await expect(saveNote('n1', 'Title', '{}')).rejects.toThrow('Unauthorized');
  });

  it('throws Validation failed for invalid data', async () => {
    await expect(saveNote('n1', '', '{}')).rejects.toThrow('Validation failed');
  });

  it('throws Not found when note does not exist', async () => {
    mockUpdateNote.mockReturnValueOnce(null);
    await expect(saveNote('n1', 'Title', '{}')).rejects.toThrow('Not found');
  });

  it('calls revalidatePath on success', async () => {
    const note = { id: 'n1', title: 'Title' };
    mockUpdateNote.mockReturnValueOnce(note as any);
    await saveNote('n1', 'Title', '{}');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/notes/n1');
  });

  it('returns the updated note', async () => {
    const note = { id: 'n1', title: 'Title', contentJson: '{}' };
    mockUpdateNote.mockReturnValueOnce(note as any);
    const result = await saveNote('n1', 'Title', '{}');
    expect(result).toEqual(note);
  });

  it('passes validated data to updateNote', async () => {
    mockUpdateNote.mockReturnValueOnce({ id: 'n1' } as any);
    await saveNote('n1', 'My Title', '{"doc":true}');
    expect(mockUpdateNote).toHaveBeenCalledWith('u1', 'n1', {
      title: 'My Title',
      contentJson: '{"doc":true}',
    });
  });
});

describe('deleteNoteAction', () => {
  it('throws Unauthorized when no session', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    await expect(deleteNoteAction('n1')).rejects.toThrow('Unauthorized');
  });

  it('throws Not found when note does not exist', async () => {
    mockDeleteNote.mockReturnValueOnce(false);
    await expect(deleteNoteAction('n1')).rejects.toThrow('Not found');
  });

  it('calls redirect to /dashboard on success', async () => {
    mockDeleteNote.mockReturnValueOnce(true);
    await expect(deleteNoteAction('n1')).rejects.toThrow(/NEXT_REDIRECT/);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });

  it('passes correct userId and noteId to deleteNote', async () => {
    mockDeleteNote.mockReturnValueOnce(true);
    try {
      await deleteNoteAction('n1');
    } catch {
      // redirect throws
    }
    expect(mockDeleteNote).toHaveBeenCalledWith('u1', 'n1');
  });
});
