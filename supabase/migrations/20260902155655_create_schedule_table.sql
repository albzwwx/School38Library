/*
# Create schedule_images table + storage bucket

## Overview
Creates a new table and storage bucket for schedule images (PNG/JPG of class
schedules and bell timetables). This supports the new "Расписание" tab.

## New Tables

### schedule_images
- `id` (uuid, PK)
- `name` (text, not null) — display name for the schedule image
- `file_path` (text, not null) — path in the `schedule` storage bucket
- `created_at` (timestamptz) — when the image was uploaded

## Storage
- Creates a public storage bucket named `schedule` for image uploads.
- Sets a 10 MB file size limit and image-only MIME types.

## Security
- RLS enabled on `schedule_images` with `TO anon, authenticated` full CRUD
  (single-tenant shared app, same pattern as `books`).
- Storage bucket is public for read with anon write access.
*/

CREATE TABLE IF NOT EXISTS schedule_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_schedule" ON schedule_images;
CREATE POLICY "anon_select_schedule" ON schedule_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_schedule" ON schedule_images;
CREATE POLICY "anon_insert_schedule" ON schedule_images FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_schedule" ON schedule_images;
CREATE POLICY "anon_update_schedule" ON schedule_images FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_schedule" ON schedule_images;
CREATE POLICY "anon_delete_schedule" ON schedule_images FOR DELETE
  TO anon, authenticated USING (true);

-- Storage bucket for schedule images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'schedule',
  'schedule',
  true,
  10485760,  -- 10 MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']::text[];

-- Storage policies
DROP POLICY IF EXISTS "anon_read_schedule_bucket" ON storage.objects;
CREATE POLICY "anon_read_schedule_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'schedule');

DROP POLICY IF EXISTS "anon_insert_schedule_bucket" ON storage.objects;
CREATE POLICY "anon_insert_schedule_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'schedule');

DROP POLICY IF EXISTS "anon_update_schedule_bucket" ON storage.objects;
CREATE POLICY "anon_update_schedule_bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'schedule') WITH CHECK (bucket_id = 'schedule');

DROP POLICY IF EXISTS "anon_delete_schedule_bucket" ON storage.objects;
CREATE POLICY "anon_delete_schedule_bucket" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'schedule');
