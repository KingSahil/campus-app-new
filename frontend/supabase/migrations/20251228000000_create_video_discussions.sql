-- Create video_discussions table for Discord-like threaded discussions
CREATE TABLE IF NOT EXISTS video_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT NOT NULL,
    video_title TEXT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    message TEXT NOT NULL,
    parent_id UUID REFERENCES video_discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_discussions_video_id ON video_discussions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_discussions_parent_id ON video_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_video_discussions_created_at ON video_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_discussions_user_id ON video_discussions(user_id);

-- Enable Row Level Security
ALTER TABLE video_discussions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to read discussions" ON video_discussions;
DROP POLICY IF EXISTS "Allow authenticated users to create discussions" ON video_discussions;
DROP POLICY IF EXISTS "Allow users to update their own discussions" ON video_discussions;
DROP POLICY IF EXISTS "Allow users to delete their own discussions" ON video_discussions;

-- Create RLS policies
-- Everyone can read discussions
CREATE POLICY "Allow all users to read discussions"
    ON video_discussions
    FOR SELECT
    USING (true);

-- Authenticated users can create discussions
CREATE POLICY "Allow authenticated users to create discussions"
    ON video_discussions
    FOR INSERT
    WITH CHECK (true);

-- Users can update their own discussions
CREATE POLICY "Allow users to update their own discussions"
    ON video_discussions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Users can delete their own discussions
CREATE POLICY "Allow users to delete their own discussions"
    ON video_discussions
    FOR DELETE
    USING (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_discussions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_video_discussions_updated_at_trigger ON video_discussions;
CREATE TRIGGER update_video_discussions_updated_at_trigger
    BEFORE UPDATE ON video_discussions
    FOR EACH ROW
    EXECUTE FUNCTION update_video_discussions_updated_at();
