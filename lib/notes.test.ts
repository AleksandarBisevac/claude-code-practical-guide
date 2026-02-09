import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockRun, mockGet, mockAll, mockQuery, mockNanoid } = vi.hoisted(() => {
  const mockRun = vi.fn().mockReturnValue({ changes: 1 });
  const mockGet = vi.fn();
  const mockAll = vi.fn().mockReturnValue([]);
  const mockQuery = vi.fn().mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });
  const mockNanoid = vi.fn().mockReturnValue('mock-nanoid-id');
  return { mockRun, mockGet, mockAll, mockQuery, mockNanoid };
});

vi.mock('@/lib/db', () => ({
  db: { query: mockQuery },
}));

vi.mock('nanoid', () => ({
  nanoid: mockNanoid,
}));

import {
  rowToNote,
  createNote,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
  type NoteRow,
} from './notes';

const FAKE_NOW = '2025-01-15T10:00:00.000Z';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FAKE_NOW));
  mockQuery.mockReturnValue({ run: mockRun, get: mockGet, all: mockAll });
  mockRun.mockReturnValue({ changes: 1 });
  mockGet.mockReturnValue(undefined);
  mockAll.mockReturnValue([]);
  mockNanoid.mockReturnValue('mock-nanoid-id');
});

afterEach(() => {
  vi.useRealTimers();
});

const sampleRow: NoteRow = {
  id: 'n1',
  user_id: 'u1',
  title: 'Test',
  content_json: '{}',
  is_public: 0,
  public_slug: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('rowToNote', () => {
  it('converts snake_case to camelCase', () => {
    const note = rowToNote(sampleRow);
    expect(note).toEqual({
      id: 'n1',
      userId: 'u1',
      title: 'Test',
      contentJson: '{}',
      isPublic: false,
      publicSlug: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
  });

  it('maps is_public=1 to isPublic=true', () => {
    const note = rowToNote({ ...sampleRow, is_public: 1 });
    expect(note.isPublic).toBe(true);
  });

  it('maps is_public=0 to isPublic=false', () => {
    const note = rowToNote({ ...sampleRow, is_public: 0 });
    expect(note.isPublic).toBe(false);
  });

  it('preserves public_slug', () => {
    const note = rowToNote({ ...sampleRow, public_slug: 'abc123' });
    expect(note.publicSlug).toBe('abc123');
  });
});

describe('createNote', () => {
  it('uses default title and content when not provided', () => {
    const note = createNote('u1');
    expect(note.title).toBe('Untitled note');
    expect(note.contentJson).toContain('"type":"doc"');
  });

  it('uses provided title and contentJson', () => {
    const note = createNote('u1', { title: 'My Title', contentJson: '{"doc":true}' });
    expect(note.title).toBe('My Title');
    expect(note.contentJson).toBe('{"doc":true}');
  });

  it('generates id via nanoid', () => {
    const note = createNote('u1');
    expect(note.id).toBe('mock-nanoid-id');
  });

  it('sets timestamps to current time', () => {
    const note = createNote('u1');
    expect(note.createdAt).toBe(FAKE_NOW);
    expect(note.updatedAt).toBe(FAKE_NOW);
  });

  it('defaults isPublic=false and publicSlug=null', () => {
    const note = createNote('u1');
    expect(note.isPublic).toBe(false);
    expect(note.publicSlug).toBeNull();
  });

  it('calls db.query with INSERT SQL and correct params', () => {
    createNote('u1', { title: 'T', contentJson: 'C' });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO notes'));
    expect(mockRun).toHaveBeenCalledWith('mock-nanoid-id', 'u1', 'T', 'C', FAKE_NOW, FAKE_NOW);
  });
});

describe('getNoteById', () => {
  it('returns note when found', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    const note = getNoteById('u1', 'n1');
    expect(note).not.toBeNull();
    expect(note!.id).toBe('n1');
  });

  it('returns null when not found', () => {
    mockGet.mockReturnValueOnce(undefined);
    const note = getNoteById('u1', 'n1');
    expect(note).toBeNull();
  });

  it('filters by user_id (authorization)', () => {
    getNoteById('u1', 'n1');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('user_id = ?'));
    expect(mockGet).toHaveBeenCalledWith('n1', 'u1');
  });
});

describe('getNotesByUser', () => {
  it('returns array of notes', () => {
    mockAll.mockReturnValueOnce([sampleRow, { ...sampleRow, id: 'n2' }]);
    const notes = getNotesByUser('u1');
    expect(notes).toHaveLength(2);
  });

  it('returns empty array when no notes', () => {
    mockAll.mockReturnValueOnce([]);
    const notes = getNotesByUser('u1');
    expect(notes).toEqual([]);
  });

  it('orders by updated_at DESC', () => {
    getNotesByUser('u1');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY updated_at DESC'));
  });
});

describe('updateNote', () => {
  it('returns updated note when found', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    const note = updateNote('u1', 'n1', { title: 'New' });
    expect(note).not.toBeNull();
    expect(note!.title).toBe('New');
  });

  it('preserves unmodified fields', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    const note = updateNote('u1', 'n1', { title: 'New' });
    expect(note!.contentJson).toBe('{}');
  });

  it('returns null when note not found', () => {
    mockGet.mockReturnValueOnce(undefined);
    const note = updateNote('u1', 'n1', { title: 'New' });
    expect(note).toBeNull();
  });

  it('updates updatedAt timestamp', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    const note = updateNote('u1', 'n1', { title: 'New' });
    expect(note!.updatedAt).toBe(FAKE_NOW);
  });

  it('calls UPDATE SQL with correct params', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    updateNote('u1', 'n1', { title: 'New', contentJson: 'C2' });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE notes SET'));
    expect(mockRun).toHaveBeenCalledWith('New', 'C2', FAKE_NOW, 'n1', 'u1');
  });
});

describe('deleteNote', () => {
  it('returns true when a row is deleted', () => {
    mockRun.mockReturnValueOnce({ changes: 1 });
    expect(deleteNote('u1', 'n1')).toBe(true);
  });

  it('returns false when no row is deleted', () => {
    mockRun.mockReturnValueOnce({ changes: 0 });
    expect(deleteNote('u1', 'n1')).toBe(false);
  });

  it('filters by user_id', () => {
    deleteNote('u1', 'n1');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('user_id = ?'));
  });
});

describe('setNotePublic', () => {
  it('returns null when note not found', () => {
    mockGet.mockReturnValueOnce(undefined);
    expect(setNotePublic('u1', 'n1', true)).toBeNull();
  });

  it('generates slug when enabling public and no existing slug', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    const note = setNotePublic('u1', 'n1', true);
    expect(note!.isPublic).toBe(true);
    expect(note!.publicSlug).toBe('mock-nanoid-id');
  });

  it('preserves existing slug when enabling public', () => {
    mockGet.mockReturnValueOnce({ ...sampleRow, public_slug: 'existing-slug' });
    const note = setNotePublic('u1', 'n1', true);
    expect(note!.publicSlug).toBe('existing-slug');
  });

  it('nullifies slug when disabling public', () => {
    mockGet.mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: 'slug' });
    const note = setNotePublic('u1', 'n1', false);
    expect(note!.publicSlug).toBeNull();
    expect(note!.isPublic).toBe(false);
  });

  it('calls UPDATE with correct is_public and slug values', () => {
    mockGet.mockReturnValueOnce(sampleRow);
    setNotePublic('u1', 'n1', true);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE notes SET is_public'));
    expect(mockRun).toHaveBeenCalledWith(1, 'mock-nanoid-id', FAKE_NOW, 'n1', 'u1');
  });
});

describe('getNoteByPublicSlug', () => {
  it('returns note when found with is_public=1', () => {
    mockGet.mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: 'slug' });
    const note = getNoteByPublicSlug('slug');
    expect(note).not.toBeNull();
  });

  it('returns null when not found', () => {
    mockGet.mockReturnValueOnce(undefined);
    expect(getNoteByPublicSlug('slug')).toBeNull();
  });

  it('does not filter by user_id', () => {
    getNoteByPublicSlug('slug');
    const sql = mockQuery.mock.calls[mockQuery.mock.calls.length - 1][0] as string;
    expect(sql).not.toContain('user_id');
    expect(sql).toContain('is_public = 1');
  });
});
