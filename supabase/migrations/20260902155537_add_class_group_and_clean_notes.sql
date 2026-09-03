/*
# Add class_group to homework + clean notes table

## Overview
1. Adds a `class_group` column to the `homework` table so homework can be
   associated with a specific class (e.g. "9-А", "10-Б") and filtered by it.
2. Deletes all rows from the `notes` table to remove any test/personal notes —
   notes are moving to localStorage and should no longer be stored in the database.

## Changes

### homework (modified)
- New column: `class_group` (text, nullable) — stores the class identifier
  like "9-А", "10-Б". Nullable so existing rows and homework without a
  specific class group still work.

### notes (modified)
- All rows deleted to clear test data. The table itself is kept but the app
  no longer reads from or writes to it.

## Security
- No policy changes needed. The existing `WITH CHECK (true)` policies on
  homework cover the new nullable column.
*/

-- Add class_group column to homework
ALTER TABLE homework ADD COLUMN IF NOT EXISTS class_group text;

-- Create index for class_group filtering
CREATE INDEX IF NOT EXISTS idx_homework_class_group ON homework(class_group);

-- Delete all notes from the database (notes are moving to localStorage)
DELETE FROM notes;
