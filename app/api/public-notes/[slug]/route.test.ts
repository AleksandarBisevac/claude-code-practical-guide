import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/notes', () => ({
  getNoteByPublicSlug: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: { query: vi.fn().mockReturnValue({ run: vi.fn(), get: vi.fn(), all: vi.fn() }) },
}));

import { GET } from './route';
import { getNoteByPublicSlug } from '@/lib/notes';

const mockGetNoteByPublicSlug = vi.mocked(getNoteByPublicSlug);

const params = Promise.resolve({ slug: 'abc123' });

describe('GET /api/public-notes/[slug]', () => {
  it('returns 404 when note not found', async () => {
    mockGetNoteByPublicSlug.mockReturnValueOnce(null);
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 200 with note data', async () => {
    const note = { id: 'n1', title: 'Public Note', isPublic: true, publicSlug: 'abc123' };
    mockGetNoteByPublicSlug.mockReturnValueOnce(note as any);
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Public Note');
  });

  it('returns 500 on error', async () => {
    mockGetNoteByPublicSlug.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await GET(new Request('http://localhost'), { params });
    expect(res.status).toBe(500);
  });

  it('does not require authentication', async () => {
    mockGetNoteByPublicSlug.mockReturnValueOnce(null);
    await GET(new Request('http://localhost'), { params });
    // No auth mock was set up - if it tried to call auth, it would throw
    expect(mockGetNoteByPublicSlug).toHaveBeenCalledWith('abc123');
  });
});
