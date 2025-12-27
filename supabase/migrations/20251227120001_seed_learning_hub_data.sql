-- Seed data for Learning Hub
-- This adds realistic sample subjects, topics, and videos

-- Insert subjects
INSERT INTO subjects (id, name, topics_preview) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Physics', 'Quantum Mechanics, Electrodynamics, Thermodynamics'),
  ('22222222-2222-2222-2222-222222222222', 'Mathematics', 'Calculus, Linear Algebra, Differential Equations'),
  ('33333333-3333-3333-3333-333333333333', 'Computer Science', 'Data Structures, Algorithms, Operating Systems'),
  ('44444444-4444-4444-4444-444444444444', 'Chemistry', 'Organic Chemistry, Physical Chemistry, Inorganic Chemistry'),
  ('55555555-5555-5555-5555-555555555555', 'Biology', 'Cell Biology, Genetics, Ecology'),
  ('66666666-6666-6666-6666-666666666666', 'English Literature', 'Poetry, Drama, Prose')
ON CONFLICT (id) DO NOTHING;

-- Insert topics for Physics
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Introduction to Physics', 0),
  ('11111111-1111-1111-1111-111111111111', 'Classical Mechanics', 0),
  ('11111111-1111-1111-1111-111111111111', 'Quantum Mechanics', 0),
  ('11111111-1111-1111-1111-111111111111', 'Electrodynamics', 0),
  ('11111111-1111-1111-1111-111111111111', 'Thermodynamics', 0)
ON CONFLICT DO NOTHING;

-- Insert topics for Mathematics
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Algebra Fundamentals', 0),
  ('22222222-2222-2222-2222-222222222222', 'Calculus I', 0),
  ('22222222-2222-2222-2222-222222222222', 'Calculus II', 0),
  ('22222222-2222-2222-2222-222222222222', 'Linear Algebra', 0),
  ('22222222-2222-2222-2222-222222222222', 'Differential Equations', 0)
ON CONFLICT DO NOTHING;

-- Insert topics for Computer Science
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Programming Basics', 0),
  ('33333333-3333-3333-3333-333333333333', 'Data Structures', 0),
  ('33333333-3333-3333-3333-333333333333', 'Algorithms', 0),
  ('33333333-3333-3333-3333-333333333333', 'Database Systems', 0),
  ('33333333-3333-3333-3333-333333333333', 'Operating Systems', 0)
ON CONFLICT DO NOTHING;

-- Insert topics for Chemistry
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Chemical Bonding', 0),
  ('44444444-4444-4444-4444-444444444444', 'Organic Chemistry Basics', 0),
  ('44444444-4444-4444-4444-444444444444', 'Thermochemistry', 0),
  ('44444444-4444-4444-4444-444444444444', 'Reaction Mechanisms', 0)
ON CONFLICT DO NOTHING;

-- Insert topics for Biology
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Cell Structure and Function', 0),
  ('55555555-5555-5555-5555-555555555555', 'DNA and Genetics', 0),
  ('55555555-5555-5555-5555-555555555555', 'Evolution', 0),
  ('55555555-5555-5555-5555-555555555555', 'Ecology and Ecosystems', 0)
ON CONFLICT DO NOTHING;

-- Insert topics for English Literature
INSERT INTO topics (subject_id, name, video_count) VALUES
  ('66666666-6666-6666-6666-666666666666', 'Shakespeare Studies', 0),
  ('66666666-6666-6666-6666-666666666666', 'Modern Poetry', 0),
  ('66666666-6666-6666-6666-666666666666', 'Victorian Literature', 0),
  ('66666666-6666-6666-6666-666666666666', 'Literary Analysis', 0)
ON CONFLICT DO NOTHING;

-- Sample videos can be added through the app interface
-- Users can add YouTube, Vimeo, or other video platform links
