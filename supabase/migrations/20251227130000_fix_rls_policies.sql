-- Fix RLS policies to allow anonymous access
-- This allows operations without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can create subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can update subjects" ON subjects;
DROP POLICY IF EXISTS "Anyone can delete subjects" ON subjects;

DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
DROP POLICY IF EXISTS "Anyone can create topics" ON topics;
DROP POLICY IF EXISTS "Anyone can update topics" ON topics;
DROP POLICY IF EXISTS "Anyone can delete topics" ON topics;

DROP POLICY IF EXISTS "Anyone can view videos" ON videos;
DROP POLICY IF EXISTS "Anyone can create videos" ON videos;
DROP POLICY IF EXISTS "Anyone can update videos" ON videos;
DROP POLICY IF EXISTS "Anyone can delete videos" ON videos;

-- Create new policies allowing anonymous access
-- SUBJECTS
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create subjects"
  ON subjects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update subjects"
  ON subjects FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete subjects"
  ON subjects FOR DELETE
  USING (true);

-- TOPICS
CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create topics"
  ON topics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update topics"
  ON topics FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete topics"
  ON topics FOR DELETE
  USING (true);

-- VIDEOS
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON videos FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete videos"
  ON videos FOR DELETE
  USING (true);
