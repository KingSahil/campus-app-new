-- Modify notes table
-- Remove content field and add notes_pdf and assignment fields
ALTER TABLE notes DROP COLUMN IF EXISTS content;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS notes_pdf TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS assignment TEXT;

-- Modify questions table
-- Remove title and question_type fields
ALTER TABLE questions DROP COLUMN IF EXISTS title;
ALTER TABLE questions DROP COLUMN IF EXISTS question_type;
