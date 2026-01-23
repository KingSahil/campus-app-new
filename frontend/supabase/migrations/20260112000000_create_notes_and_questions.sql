-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes_pdf TEXT,
    assignment TEXT,
    upvotes INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_by_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    upvotes INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_by_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create note_upvotes table
CREATE TABLE IF NOT EXISTS note_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    note_title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- Create question_upvotes table
CREATE TABLE IF NOT EXISTS question_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

-- Create note_discussions table
CREATE TABLE IF NOT EXISTS note_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    note_title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    message TEXT NOT NULL,
    parent_id UUID REFERENCES note_discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create question_discussions table
CREATE TABLE IF NOT EXISTS question_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_title TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    message TEXT NOT NULL,
    parent_id UUID REFERENCES question_discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_upvotes ON notes(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_upvotes ON questions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_note_upvotes_note_id ON note_upvotes(note_id);
CREATE INDEX IF NOT EXISTS idx_note_upvotes_user_id ON note_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_question_upvotes_question_id ON question_upvotes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_user_id ON question_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_note_discussions_note_id ON note_discussions(note_id);
CREATE INDEX IF NOT EXISTS idx_note_discussions_parent_id ON note_discussions(parent_id);

CREATE INDEX IF NOT EXISTS idx_question_discussions_question_id ON question_discussions(question_id);
CREATE INDEX IF NOT EXISTS idx_question_discussions_parent_id ON question_discussions(parent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_discussions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Notes are viewable by everyone"
    ON notes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert notes"
    ON notes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notes"
    ON notes FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own notes"
    ON notes FOR DELETE
    USING (true);

-- Create RLS policies for questions
CREATE POLICY "Questions are viewable by everyone"
    ON questions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert questions"
    ON questions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own questions"
    ON questions FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own questions"
    ON questions FOR DELETE
    USING (true);

-- Create RLS policies for note_upvotes
CREATE POLICY "Note upvotes are viewable by everyone"
    ON note_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert note upvotes"
    ON note_upvotes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own note upvotes"
    ON note_upvotes FOR DELETE
    USING (true);

-- Create RLS policies for question_upvotes
CREATE POLICY "Question upvotes are viewable by everyone"
    ON question_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert question upvotes"
    ON question_upvotes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete their own question upvotes"
    ON question_upvotes FOR DELETE
    USING (true);

-- Create RLS policies for note_discussions
CREATE POLICY "Note discussions are viewable by everyone"
    ON note_discussions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert note discussions"
    ON note_discussions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own note discussions"
    ON note_discussions FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own note discussions"
    ON note_discussions FOR DELETE
    USING (true);

-- Create RLS policies for question_discussions
CREATE POLICY "Question discussions are viewable by everyone"
    ON question_discussions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert question discussions"
    ON question_discussions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own question discussions"
    ON question_discussions FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own question discussions"
    ON question_discussions FOR DELETE
    USING (true);
