-- Create table for AI Q&A cache
CREATE TABLE IF NOT EXISTS video_ai_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(video_id, question)
);

-- Create table for Quiz cache
CREATE TABLE IF NOT EXISTS video_quizzes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id text NOT NULL UNIQUE,
    quiz_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE video_ai_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as video_chapters)
CREATE POLICY "Allow public read access to AI questions" ON video_ai_questions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to AI questions" ON video_ai_questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to AI questions" ON video_ai_questions
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to AI questions" ON video_ai_questions
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access to quizzes" ON video_quizzes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to quizzes" ON video_quizzes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to quizzes" ON video_quizzes
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to quizzes" ON video_quizzes
    FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_video_ai_questions_video_id ON video_ai_questions(video_id);
CREATE INDEX idx_video_ai_questions_created_at ON video_ai_questions(created_at DESC);
CREATE INDEX idx_video_quizzes_video_id ON video_quizzes(video_id);
