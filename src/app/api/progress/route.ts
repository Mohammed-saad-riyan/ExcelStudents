import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  // Get attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select(`
      *,
      class_sessions:session_id (title, date, course_id)
    `)
    .eq("user_id", userId)
    .eq("present", true);

  // Get exam attempts
  const { data: examAttempts } = await supabase
    .from("exam_attempts")
    .select(`
      *,
      exams:exam_id (title, total_marks)
    `)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  // Get assignment submissions
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select(`
      *,
      assignments:assignment_id (title, total_marks, due_date)
    `)
    .eq("user_id", userId);

  // Get total counts
  const { count: totalSessions } = await supabase
    .from("class_sessions")
    .select("*", { count: "exact", head: true });

  const { count: totalAssignments } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true });

  // Transform attendance records
  const attendanceRecords = attendance?.map((a) => ({
    id: a.id,
    userId: a.user_id,
    sessionId: a.session_id,
    present: a.present,
    createdAt: a.created_at,
    session: a.class_sessions
      ? {
          title: a.class_sessions.title,
          date: a.class_sessions.date,
          courseId: a.class_sessions.course_id,
        }
      : null,
  }));

  // Transform exam attempts
  const transformedAttempts = examAttempts?.map((a) => ({
    id: a.id,
    userId: a.user_id,
    examId: a.exam_id,
    answers: a.answers,
    score: a.score,
    totalMarks: a.total_marks,
    passed: a.passed,
    startedAt: a.started_at,
    completedAt: a.completed_at,
    exam: a.exams
      ? {
          title: a.exams.title,
          totalMarks: a.exams.total_marks,
        }
      : null,
  }));

  // Transform submissions
  const transformedSubmissions = submissions?.map((s) => ({
    id: s.id,
    userId: s.user_id,
    assignmentId: s.assignment_id,
    content: s.content,
    attachments: s.attachments,
    marks: s.marks,
    feedback: s.feedback,
    status: s.status,
    submittedAt: s.submitted_at,
    assignment: s.assignments
      ? {
          title: s.assignments.title,
          totalMarks: s.assignments.total_marks,
          dueDate: s.assignments.due_date,
        }
      : null,
  }));

  return NextResponse.json({
    attendance: {
      attended: attendance?.length || 0,
      total: totalSessions || 0,
      records: attendanceRecords,
    },
    exams: {
      attempts: transformedAttempts,
      totalAttempts: examAttempts?.length || 0,
      passed: examAttempts?.filter((a) => a.passed).length || 0,
    },
    assignments: {
      submitted: submissions?.length || 0,
      total: totalAssignments || 0,
      submissions: transformedSubmissions,
    },
  });
}
