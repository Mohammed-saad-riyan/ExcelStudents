import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  // Get student's enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);

  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];

  // Get exams for enrolled courses
  const { data: exams, error } = await supabase
    .from("exams")
    .select(`
      *,
      courses:course_id (title)
    `)
    .eq("is_active", true)
    .in("course_id", enrolledCourseIds.length > 0 ? enrolledCourseIds : ["none"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }

  // Get exam access for this student
  const examIds = exams?.map(e => e.id) || [];
  const { data: accessGrants } = await supabase
    .from("exam_access")
    .select("exam_id")
    .eq("user_id", userId)
    .in("exam_id", examIds.length > 0 ? examIds : ["none"]);

  const accessSet = new Set(accessGrants?.map(a => a.exam_id) || []);

  // Get exam attempts for this student
  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("exam_id, status, score, total_marks, completed_at")
    .eq("user_id", userId)
    .in("exam_id", examIds.length > 0 ? examIds : ["none"]);

  const attemptMap = new Map(attempts?.map(a => [a.exam_id, a]) || []);

  // Transform to match frontend expectations
  const transformedExams = exams?.map((e) => {
    const attempt = attemptMap.get(e.id);
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      courseId: e.course_id,
      type: e.type,
      examType: e.exam_type || e.type,
      duration: e.duration,
      totalMarks: e.total_marks,
      passingMarks: e.passing_marks,
      formUrl: e.form_url,
      isActive: e.is_active,
      createdAt: e.created_at,
      course: e.courses,
      // Access and attempt info
      hasAccess: accessSet.has(e.id),
      attempt: attempt ? {
        status: attempt.status || "submitted",
        score: attempt.score,
        totalMarks: attempt.total_marks,
        completedAt: attempt.completed_at,
      } : null,
    };
  });

  return NextResponse.json(transformedExams);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { examId, answers } = await request.json();

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const questions = JSON.parse(exam.questions);
  const parsedAnswers = answers as Record<string, string>;
  let score = 0;

  questions.forEach((q: { id: string; correctAnswer: string; marks: number }) => {
    if (parsedAnswers[q.id] === q.correctAnswer) {
      score += q.marks;
    }
  });

  const { data: attempt, error } = await supabase
    .from("exam_attempts")
    .insert({
      id: generateId(),
      user_id: (session.user as { id: string }).id,
      exam_id: examId,
      answers: JSON.stringify(answers),
      score,
      total_marks: exam.total_marks,
      passed: score >= exam.passing_marks,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  // Transform for frontend
  return NextResponse.json({
    id: attempt.id,
    userId: attempt.user_id,
    examId: attempt.exam_id,
    answers: attempt.answers,
    score: attempt.score,
    totalMarks: attempt.total_marks,
    passed: attempt.passed,
    startedAt: attempt.started_at,
    completedAt: attempt.completed_at,
  });
}
