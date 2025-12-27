-- /*
--   # Initial Campus App Database Schema

--   ## New Tables
  
--   ### 1. `profiles`
--     - `id` (uuid, primary key) - References auth.users
--     - `email` (text) - User email
--     - `full_name` (text) - User's full name
--     - `role` (text) - 'student' or 'admin'
--     - `student_id` (text) - Student ID number
--     - `avatar_url` (text) - Profile picture URL
--     - `created_at` (timestamptz)
--     - `updated_at` (timestamptz)

--   ### 2. `classes`
--     - `id` (uuid, primary key)
--     - `name` (text) - Class name (e.g., "Physics")
--     - `description` (text) - Class description
--     - `instructor_id` (uuid) - References profiles
--     - `room_number` (text) - Room location
--     - `created_at` (timestamptz)
    
--   ### 3. `class_schedules`
--     - `id` (uuid, primary key)
--     - `class_id` (uuid) - References classes
--     - `day_of_week` (int) - 0-6 for Sunday-Saturday
--     - `start_time` (time)
--     - `end_time` (time)
--     - `created_at` (timestamptz)

--   ### 4. `class_enrollments`
--     - `id` (uuid, primary key)
--     - `class_id` (uuid) - References classes
--     - `student_id` (uuid) - References profiles
--     - `enrolled_at` (timestamptz)

--   ### 5. `attendance_sessions`
--     - `id` (uuid, primary key)
--     - `class_id` (uuid) - References classes
--     - `started_at` (timestamptz)
--     - `ended_at` (timestamptz)
--     - `session_code` (text) - QR code or join code
--     - `is_active` (boolean)
--     - `created_by` (uuid) - References profiles

--   ### 6. `attendance_records`
--     - `id` (uuid, primary key)
--     - `session_id` (uuid) - References attendance_sessions
--     - `student_id` (uuid) - References profiles
--     - `status` (text) - 'present', 'absent', 'late'
--     - `marked_at` (timestamptz)

--   ### 7. `notices`
--     - `id` (uuid, primary key)
--     - `title` (text)
--     - `content` (text)
--     - `category` (text) - 'urgent', 'general', 'course_specific'
--     - `priority` (text) - 'high', 'medium', 'low'
--     - `source` (text) - Who posted it
--     - `class_id` (uuid) - References classes (nullable for general notices)
--     - `created_by` (uuid) - References profiles
--     - `created_at` (timestamptz)

--   ## Security
--     - Enable RLS on all tables
--     - Add policies for authenticated users based on their role
-- */

-- -- Create profiles table
-- CREATE TABLE IF NOT EXISTS profiles (
--   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email text NOT NULL,
--   full_name text,
--   role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
--   student_id text UNIQUE,
--   avatar_url text,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own profile"
--   ON profiles FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile"
--   ON profiles FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- -- Create classes table
-- CREATE TABLE IF NOT EXISTS classes (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   description text,
--   instructor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
--   room_number text,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Anyone can view classes"
--   ON classes FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Admins can manage classes"
--   ON classes FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create class_schedules table
-- CREATE TABLE IF NOT EXISTS class_schedules (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
--   day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
--   start_time time NOT NULL,
--   end_time time NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Anyone can view schedules"
--   ON class_schedules FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Admins can manage schedules"
--   ON class_schedules FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create class_enrollments table
-- CREATE TABLE IF NOT EXISTS class_enrollments (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
--   student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
--   enrolled_at timestamptz DEFAULT now(),
--   UNIQUE(class_id, student_id)
-- );

-- ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Students can view own enrollments"
--   ON class_enrollments FOR SELECT
--   TO authenticated
--   USING (auth.uid() = student_id);

-- CREATE POLICY "Admins can manage enrollments"
--   ON class_enrollments FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create attendance_sessions table
-- CREATE TABLE IF NOT EXISTS attendance_sessions (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
--   started_at timestamptz DEFAULT now(),
--   ended_at timestamptz,
--   session_code text,
--   is_active boolean DEFAULT true,
--   created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Students can view active sessions for enrolled classes"
--   ON attendance_sessions FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM class_enrollments
--       WHERE class_enrollments.class_id = attendance_sessions.class_id
--       AND class_enrollments.student_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Admins can manage sessions"
--   ON attendance_sessions FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create attendance_records table
-- CREATE TABLE IF NOT EXISTS attendance_records (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   session_id uuid REFERENCES attendance_sessions(id) ON DELETE CASCADE NOT NULL,
--   student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
--   status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
--   marked_at timestamptz DEFAULT now(),
--   UNIQUE(session_id, student_id)
-- );

-- ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Students can view own attendance"
--   ON attendance_records FOR SELECT
--   TO authenticated
--   USING (auth.uid() = student_id);

-- CREATE POLICY "Students can mark own attendance"
--   ON attendance_records FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = student_id);

-- CREATE POLICY "Admins can manage attendance records"
--   ON attendance_records FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create notices table
-- CREATE TABLE IF NOT EXISTS notices (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   title text NOT NULL,
--   content text NOT NULL,
--   category text NOT NULL DEFAULT 'general' CHECK (category IN ('urgent', 'general', 'course_specific')),
--   priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
--   source text NOT NULL,
--   class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
--   created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Everyone can view notices"
--   ON notices FOR SELECT
--   TO authenticated
--   USING (
--     CASE
--       WHEN class_id IS NULL THEN true
--       ELSE EXISTS (
--         SELECT 1 FROM class_enrollments
--         WHERE class_enrollments.class_id = notices.class_id
--         AND class_enrollments.student_id = auth.uid()
--       )
--     END
--   );

-- CREATE POLICY "Admins can manage notices"
--   ON notices FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- -- Create updated_at trigger function
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Add trigger to profiles table
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
--   ) THEN
--     CREATE TRIGGER update_profiles_updated_at
--       BEFORE UPDATE ON profiles
--       FOR EACH ROW
--       EXECUTE FUNCTION update_updated_at_column();
--   END IF;
-- END $$;