-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow everyone to read settings
CREATE POLICY "Allow public read access" ON settings
    FOR SELECT TO public USING (true);

-- FIX: Allow public (anon) write access because Supabase client is not using Auth0 tokens
-- First drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Allow authenticated insert/update access" ON settings;

-- Create the new permissive policy
CREATE POLICY "Allow public insert/update access" ON settings
    FOR ALL TO public USING (true) WITH CHECK (true);
