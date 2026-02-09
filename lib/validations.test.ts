import { describe, it, expect } from 'vitest';
import { createNoteSchema, updateNoteSchema, shareNoteSchema } from './validations';

describe('createNoteSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid title and contentJson', () => {
    const result = createNoteSchema.safeParse({ title: 'My Note', contentJson: '{}' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: 'My Note', contentJson: '{}' });
  });

  it('rejects title shorter than 1 char (empty string)', () => {
    const result = createNoteSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 500 chars', () => {
    const result = createNoteSchema.safeParse({ title: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepts title at max 500 chars', () => {
    const result = createNoteSchema.safeParse({ title: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });

  it('rejects contentJson longer than 500000 chars', () => {
    const result = createNoteSchema.safeParse({ contentJson: 'x'.repeat(500_001) });
    expect(result.success).toBe(false);
  });

  it('rejects non-string title', () => {
    const result = createNoteSchema.safeParse({ title: 123 });
    expect(result.success).toBe(false);
  });

  it('rejects non-string contentJson', () => {
    const result = createNoteSchema.safeParse({ contentJson: true });
    expect(result.success).toBe(false);
  });

  it('strips unknown properties', () => {
    const result = createNoteSchema.safeParse({ title: 'Test', extra: 'field' });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('extra');
  });
});

describe('updateNoteSchema', () => {
  it('accepts empty object', () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid title', () => {
    const result = updateNoteSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('rejects empty string title', () => {
    const result = updateNoteSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 500 chars', () => {
    const result = updateNoteSchema.safeParse({ title: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects contentJson over 500000 chars', () => {
    const result = updateNoteSchema.safeParse({ contentJson: 'x'.repeat(500_001) });
    expect(result.success).toBe(false);
  });

  it('strips unknown properties', () => {
    const result = updateNoteSchema.safeParse({ title: 'T', unknown: 1 });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('unknown');
  });
});

describe('shareNoteSchema', () => {
  it('accepts isPublic: true', () => {
    const result = shareNoteSchema.safeParse({ isPublic: true });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ isPublic: true });
  });

  it('accepts isPublic: false', () => {
    const result = shareNoteSchema.safeParse({ isPublic: false });
    expect(result.success).toBe(true);
  });

  it('rejects missing isPublic', () => {
    const result = shareNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean isPublic', () => {
    const result = shareNoteSchema.safeParse({ isPublic: 'yes' });
    expect(result.success).toBe(false);
  });
});
