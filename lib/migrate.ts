import { Database } from "bun:sqlite";

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content_json TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        public_slug TEXT UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
      CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);
    `,
  },
];

export function migrate(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    (db.query("SELECT version FROM _migrations").all() as { version: number }[]).map(
      (r) => r.version
    )
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    db.run("BEGIN");
    try {
      db.run(migration.sql);
      db.query("INSERT INTO _migrations (version) VALUES (?)").run(
        migration.version
      );
      db.run("COMMIT");
    } catch (err) {
      db.run("ROLLBACK");
      throw new Error(
        `Migration ${migration.version} failed: ${err instanceof Error ? err.message : err}`
      );
    }
  }
}
