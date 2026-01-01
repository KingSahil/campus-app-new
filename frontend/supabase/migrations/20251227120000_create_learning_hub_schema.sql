-- Learning Hub Schema
-- Tables for subjects, topics, and videos

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  topics_preview text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (true);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  video_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete topics"
  ON topics FOR DELETE
  TO authenticated
  USING (true);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  thumbnail text,
  duration text DEFAULT '0:00',
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for subjects updated_at
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for topics updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for videos updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update video count in topics
CREATE OR REPLACE FUNCTION update_topic_video_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics 
    SET video_count = video_count + 1 
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics 
    SET video_count = video_count - 1 
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update video count
CREATE TRIGGER update_video_count_trigger
  AFTER INSERT OR DELETE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_video_count();
