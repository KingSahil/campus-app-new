-- Video Chapters and Summary Storage
-- Store AI-generated chapters and summaries for videos

-- Create video_chapters table to store generated chapters
CREATE TABLE IF NOT EXISTS video_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  chapters jsonb NOT NULL, -- Array of {timestamp, title, summary}
  overall_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(video_id) -- Only one chapters record per video
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_chapters_video_id ON video_chapters(video_id);

-- Enable RLS
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access like other tables
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

-- Create trigger for updated_at
CREATE TRIGGER update_video_chapters_updated_at
  BEFORE UPDATE ON video_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
