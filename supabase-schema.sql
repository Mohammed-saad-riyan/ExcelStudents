-- Excel Academy Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- student | admin
  phone TEXT,
  avatar TEXT,
  course_interested TEXT, -- course the student is interested in during registration
  approved BOOLEAN NOT NULL DEFAULT false, -- admin must approve before student can login
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT,
  features TEXT NOT NULL, -- JSON string array
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'mcq', -- mcq | final
  duration INTEGER NOT NULL DEFAULT 0, -- minutes (0 for final exams)
  total_marks INTEGER NOT NULL DEFAULT 0,
  passing_marks INTEGER NOT NULL DEFAULT 0,
  questions TEXT NOT NULL DEFAULT '[]', -- JSON string (empty for final exams)
  form_url TEXT, -- Google Form URL for final exams
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON exams(is_active);

-- ============================================
-- EXAM ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_attempts (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  answers TEXT NOT NULL, -- JSON string
  score INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  total_marks INTEGER NOT NULL,
  attachments TEXT, -- JSON string
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);

-- ============================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT, -- JSON string
  marks INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted | graded | returned
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);

-- ============================================
-- CLASS SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS class_sessions (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_course_id ON class_sessions(course_id);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON attendance(session_id);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);

-- ============================================
-- CLASS NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS class_notes (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pdf_url TEXT,
  pdf_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_notes_course_id ON class_notes(course_id);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY DEFAULT ('c' || substr(md5(random()::text), 1, 24)),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5
  category TEXT NOT NULL, -- course | instructor | platform | other
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to class_notes table
DROP TRIGGER IF EXISTS update_class_notes_updated_at ON class_notes;
CREATE TRIGGER update_class_notes_updated_at
  BEFORE UPDATE ON class_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- D.EL.ED COURSE (additional course)
-- ============================================
-- This will be created by the seed script, but here's a placeholder insert
-- for the courses that need specific IDs

-- INSERT INTO courses (id, title, description, duration, price, features)
-- VALUES
-- ('course-ppttc', 'PPTTC - Pre & Primary Teachers Training', '...', '1 Year', 'Contact for details', '["feature1", "feature2"]'),
-- ('course-montessori', 'Montessori Teacher Training', '...', '1 Year', 'Contact for details', '["feature1", "feature2"]'),
-- ('course-ecce', 'ECCE - Early Childhood Care & Education', '...', '1 Year', 'Contact for details', '["feature1", "feature2"]'),
-- ('course-deled', 'D.El.Ed - Diploma in Elementary Education', '...', '2 Years', 'Contact for details', '["feature1", "feature2"]')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
-- After running this script, your Supabase database is ready.
-- Make sure to update your .env file with the correct Supabase credentials.
