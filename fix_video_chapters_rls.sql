-- Fix RLS policies for video_chapters table
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view video chapters" ON video_chapters;
DROP POLICY IF EXISTS "Anyone can insert video chapters" ON video_chapters;
DROP POLICY IF EXISTS "Anyone can update video chapters" ON video_chapters;
DROP POLICY IF EXISTS "Anyone can delete video chapters" ON video_chapters;

-- Create new public policies (no authentication required)
CREATE POLICY "Anyone can view video chapters"
  ON video_chapters FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert video chapters"
  ON video_chapters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update video chapters"
  ON video_chapters FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete video chapters"
  ON video_chapters FOR DELETE
  USING (true);
