import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: exams, error } = await supabase
    .from("exams")
    .select(`
      *,
      courses:course_id (title)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }

  // Transform to match frontend expectations
  const transformedExams = exams?.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    courseId: e.course_id,
    type: e.type,
    duration: e.duration,
    totalMarks: e.total_marks,
    passingMarks: e.passing_marks,
    questions: e.questions,
    formUrl: e.form_url,
    isActive: e.is_active,
    createdAt: e.created_at,
    course: e.courses,
  }));

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
