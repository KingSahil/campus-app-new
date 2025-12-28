-- Create video upvotes table
CREATE TABLE IF NOT EXISTS video_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  video_title text NOT NULL,
  user_id text NOT NULL,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_upvotes_video_id ON video_upvotes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_upvotes_user_id ON video_upvotes(user_id);

-- Enable Row Level Security
ALTER TABLE video_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view upvotes"
  ON video_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own upvotes"
  ON video_upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own upvotes"
  ON video_upvotes FOR DELETE
  USING (true);
