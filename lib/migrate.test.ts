import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRun = vi.fn();
const mockQueryRun = vi.fn();
const mockQueryAll = vi.fn().mockReturnValue([]);

const mockDb = {
  run: mockRun,
  query: vi.fn().mockReturnValue({
    run: mockQueryRun,
    all: mockQueryAll,
  }),
};

vi.mock('bun:sqlite', () => ({
  Database: vi.fn(),
}));

import { migrate } from './migrate';

beforeEach(() => {
  mockRun.mockReset();
  mockDb.query.mockReturnValue({
    run: mockQueryRun,
    all: mockQueryAll,
  });
  mockQueryRun.mockReset();
  mockQueryAll.mockReset().mockReturnValue([]);
});

describe('migrate', () => {
  it('creates _migrations table', () => {
    migrate(mockDb as any);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'),
    );
  });

  it('queries for applied migrations', () => {
    migrate(mockDb as any);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT version FROM _migrations');
  });

  it('runs pending migrations in a transaction', () => {
    mockQueryAll.mockReturnValueOnce([]);
    migrate(mockDb as any);
    expect(mockRun).toHaveBeenCalledWith('BEGIN');
    expect(mockRun).toHaveBeenCalledWith('COMMIT');
  });

  it('executes migration SQL', () => {
    mockQueryAll.mockReturnValueOnce([]);
    migrate(mockDb as any);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS notes'),
    );
  });

  it('inserts migration version after success', () => {
    mockQueryAll.mockReturnValueOnce([]);
    migrate(mockDb as any);
    expect(mockDb.query).toHaveBeenCalledWith('INSERT INTO _migrations (version) VALUES (?)');
    expect(mockQueryRun).toHaveBeenCalledWith(1);
  });

  it('skips already applied migrations', () => {
    mockQueryAll.mockReturnValueOnce([{ version: 1 }]);
    migrate(mockDb as any);
    expect(mockRun).not.toHaveBeenCalledWith('BEGIN');
  });

  it('rolls back on failure', () => {
    mockQueryAll.mockReturnValueOnce([]);
    mockRun.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS notes')) throw new Error('SQL error');
    });
    expect(() => migrate(mockDb as any)).toThrow('Migration 1 failed: SQL error');
    expect(mockRun).toHaveBeenCalledWith('ROLLBACK');
  });

  it('wraps error message with migration version', () => {
    mockQueryAll.mockReturnValueOnce([]);
    mockRun.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS notes')) throw new Error('bad sql');
    });
    expect(() => migrate(mockDb as any)).toThrow(/Migration 1 failed: bad sql/);
  });

  it('does nothing when all migrations are applied', () => {
    mockQueryAll.mockReturnValueOnce([{ version: 1 }]);
    migrate(mockDb as any);
    expect(mockRun).not.toHaveBeenCalledWith('BEGIN');
    expect(mockRun).not.toHaveBeenCalledWith('COMMIT');
  });
});
