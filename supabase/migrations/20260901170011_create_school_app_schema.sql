/*
# School Library + Homework Planner — Initial Schema

## Overview
Creates the database tables and storage bucket for a single-tenant school app
(no sign-in). The app stores textbooks (with PDF files in Supabase Storage),
homework tasks (interactive checklist), and free-form notes. All data is
intentionally shared/public within this single-tenant app, so policies use
TO anon, authenticated with USING (true).

## New Tables

### books
- `id` (uuid, PK)
- `title` (text, not null) — textbook name
- `subject` (text, not null) — school subject (Math, Physics, etc.)
- `grade` (int, not null) — class/grade level (5–11)
- `file_path` (text, not null) — path to the PDF in the `books` storage bucket
- `file_size` (bigint) — file size in bytes (optional, for display)
- `created_at` (timestamptz) — when the book was added

### homework
- `id` (uuid, PK)
- `subject` (text, not null) — subject for the assignment
- `description` (text, not null) — e.g. "№124, №125"
- `due_date` (date, not null) — when the assignment is due
- `priority` (text, not null, default 'normal') — 'low' | 'normal' | 'high'
- `completed` (boolean, not null, default false) — checklist state
- `created_at` (timestamptz) — when the task was added

### notes
- `id` (uuid, PK)
- `title` (text, not null) — note title
- `content` (text, not null, default '') — note body text
- `updated_at` (timestamptz) — last modification time
- `created_at` (timestamptz) — when the note was created

## Storage
- Creates a public storage bucket named `books` for PDF uploads.
- Sets a 50 MB file size limit and a pdf-only MIME type restriction.

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant app with no sign-in — data is intentionally shared.
- Storage bucket is public for read (so PDFs can be viewed) with anon write access.
*/

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  grade int NOT NULL CHECK (grade >= 1 AND grade <= 11),
  file_path text NOT NULL,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  description text NOT NULL,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject);
CREATE INDEX IF NOT EXISTS idx_books_grade ON books(grade);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_completed ON homework(completed);

CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

-- ============================================================
-- RLS — books
-- ============================================================

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_books" ON books;
CREATE POLICY "anon_select_books" ON books FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_books" ON books;
CREATE POLICY "anon_insert_books" ON books FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_books" ON books;
CREATE POLICY "anon_update_books" ON books FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_books" ON books;
CREATE POLICY "anon_delete_books" ON books FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- RLS — homework
-- ============================================================

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_homework" ON homework;
CREATE POLICY "anon_select_homework" ON homework FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_homework" ON homework;
CREATE POLICY "anon_insert_homework" ON homework FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_homework" ON homework;
CREATE POLICY "anon_update_homework" ON homework FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_homework" ON homework;
CREATE POLICY "anon_delete_homework" ON homework FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- RLS — notes
-- ============================================================

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  52428800,  -- 50 MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['application/pdf']::text[];

-- Storage policies: allow anon to read and upload objects in the books bucket
DROP POLICY IF EXISTS "anon_read_books_bucket" ON storage.objects;
CREATE POLICY "anon_read_books_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'books');

DROP POLICY IF EXISTS "anon_insert_books_bucket" ON storage.objects;
CREATE POLICY "anon_insert_books_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'books');

DROP POLICY IF EXISTS "anon_update_books_bucket" ON storage.objects;
CREATE POLICY "anon_update_books_bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'books') WITH CHECK (bucket_id = 'books');

DROP POLICY IF EXISTS "anon_delete_books_bucket" ON storage.objects;
CREATE POLICY "anon_delete_books_bucket" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'books');
