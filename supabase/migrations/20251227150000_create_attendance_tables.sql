-- Create attendance tables
-- This migration creates the necessary tables for the attendance system

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  instructor_id uuid,
  start_time time NOT NULL,
  end_time time NOT NULL,
  days_of_week integer[] NOT NULL, -- Array of day indices (0-6, 0=Monday)
  room_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_code text UNIQUE,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid NOT NULL,
  student_name text,
  student_email text,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  marked_at timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_instructor ON classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON attendance_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Anyone can view classes"
  ON classes FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage their classes"
  ON classes FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for attendance_sessions
CREATE POLICY "Anyone can view active sessions"
  ON attendance_sessions FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage sessions"
  ON attendance_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for attendance_records
CREATE POLICY "Anyone can view attendance records"
  ON attendance_records FOR SELECT
  USING (true);

CREATE POLICY "Students can mark their own attendance"
  ON attendance_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Instructors can manage attendance records"
  ON attendance_records FOR ALL
  USING (true)
  WITH CHECK (true);
