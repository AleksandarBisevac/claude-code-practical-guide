# CLAUDE.md

We are building the app described in the @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 (App Router) note-taking web application with rich text editing capabilities using TipTap. Users can create, edit, and share notes with public URLs. The app uses better-auth for authentication and Bun SQLite for data persistence.

**Stack:** Next.js 16, TypeScript, Bun runtime, TailwindCSS 4, TipTap editor, better-auth, SQLite

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
bun dev

# Production build
bun run build

# Start production server
bun start

# Lint code
bun run lint
```

## Authentication Setup

The app uses `better-auth` with Bun SQLite. Authentication tables are managed automatically by better-auth's CLI:

```bash
# Generate auth schema based on configuration
bun x @better-auth/cli@latest generate

# Apply migrations to create auth tables (user, session, account, verification)
bun x @better-auth/cli@latest migrate
```

**Important:** Never manually create or modify auth tables. Always use the better-auth CLI.

## Database Architecture

The application uses a single SQLite database (`database.sqlite`) with two distinct areas:

1. **Auth tables** (managed by better-auth): `user`, `session`, `account`, `verification`
2. **Application table** (managed by the app): `notes`

### Notes Table Schema

```sql
CREATE TABLE notes (
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

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_public_slug ON notes(public_slug);
CREATE INDEX idx_notes_is_public ON notes(is_public);
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
  - `page.tsx` - Landing page
  - `layout.tsx` - Root layout with fonts
  - `globals.css` - Global TailwindCSS styles
- `lib/` (to be created) - Core business logic
  - `db.ts` - Database connection and query utilities
  - `auth.ts` - better-auth configuration
  - `notes.ts` - Note repository functions
- `components/` (to be created) - React components
  - `NoteEditor.tsx` - TipTap-based rich text editor
  - `NoteList.tsx` - List view of user notes
  - `ShareToggle.tsx` - Public sharing toggle
  - `PublicNoteViewer.tsx` - Read-only note viewer

## Data Flow & Security

### Authorization Pattern

All note operations MUST filter by `user_id` to prevent cross-user access:

```typescript
// Example: Always include user_id in WHERE clause
const note = db
  .query("SELECT * FROM notes WHERE id = ? AND user_id = ?")
  .get(noteId, userId);
```

### TipTap Content Storage

- Notes are stored as **JSON strings** in the `content_json` column
- Use `JSON.stringify()` when saving to DB
- Use `JSON.parse()` when loading from DB
- Never store raw HTML to prevent XSS vulnerabilities

### Public Note Slugs

- Use a sufficiently random slug generator (e.g., nanoid with 16+ characters)
- Public notes accessed via `/p/[slug]` route
- Only notes with `is_public = 1` are accessible via public URLs

## TipTap Editor Configuration

Required extensions:

- `StarterKit` (headings H1-H3, paragraphs, bold, italic, bullet lists, horizontal rules)
- `Code` (inline code)
- `CodeBlock` (code blocks)

Toolbar buttons should support: Bold, Italic, H1/H2/H3, Paragraph, Bullet List, Inline Code, Code Block, Horizontal Rule

## API Route Structure

Planned API routes under `/api/`:

- `GET /api/notes` - List user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Toggle public sharing
- `GET /api/public-notes/:slug` - Get public note by slug

All routes (except public reads) require authentication check. Return 401 if unauthenticated.

## Path Aliases

The project uses TypeScript path aliases:

- `@/*` maps to the root directory

Example: `import { getDb } from '@/lib/db'`

## Implementation Notes

- This is a greenfield project - most features are not yet implemented
- Refer to `SPEC.md` for detailed technical specifications
- The app uses Bun runtime, so prefer Bun APIs (e.g., `bun:sqlite`) over Node.js equivalents
- Use Server Components where possible for data fetching
- Use Client Components (`"use client"`) for interactive UI (TipTap editor, forms)
- Enable experimental joins in better-auth for better performance: `experimental: { joins: true }`
