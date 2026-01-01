-- Make student_id nullable and add unique constraint on session_id + student_email
-- This allows students to mark attendance using their email without requiring a UUID student_id

ALTER TABLE attendance_records 
  ALTER COLUMN student_id DROP NOT NULL;

-- Drop the old unique constraint on session_id + student_id
ALTER TABLE attendance_records 
  DROP CONSTRAINT IF EXISTS attendance_records_session_id_student_id_key;

-- Add new unique constraint on session_id + student_email to prevent duplicate attendance
ALTER TABLE attendance_records 
  ADD CONSTRAINT attendance_records_session_email_unique 
  UNIQUE (session_id, student_email);

-- Update the index for better performance with email lookups
CREATE INDEX IF NOT EXISTS idx_attendance_records_email ON attendance_records(student_email);
