import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client with service key (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for database tables
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  course_interested: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string | null;
  features: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  course_id: string;
  type: string;
  duration: number;
  total_marks: number;
  passing_marks: number;
  questions: string;
  form_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  answers: string;
  score: number;
  total_marks: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  total_marks: number;
  attachments: string | null;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  user_id: string;
  assignment_id: string;
  content: string;
  attachments: string | null;
  marks: number | null;
  feedback: string | null;
  status: string;
  submitted_at: string;
}

export interface ClassSession {
  id: string;
  course_id: string;
  title: string;
  date: string;
  duration: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  session_id: string;
  present: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface ClassNote {
  id: string;
  course_id: string | null;
  title: string;
  content: string;
  pdf_url: string | null;
  pdf_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  rating: number;
  category: string;
  created_at: string;
}

// Helper to generate cuid-like IDs
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}
