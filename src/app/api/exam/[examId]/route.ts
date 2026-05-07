import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

// GET - Get exam details for taking (student)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;
  const userId = (session.user as { id: string }).id;

  // Get exam details
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*, courses:course_id (id, title)")
    .eq("id", examId)
    .eq("is_active", true)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Check if student has access to this exam
  const { data: access } = await supabase
    .from("exam_access")
    .select("id")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .single();

  if (!access) {
    return NextResponse.json({ error: "You don't have access to this exam" }, { status: 403 });
  }

  // Check for existing attempt
  const { data: existingAttempt } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .single();

  // Parse sections/questions
  let sections = [];
  try {
    sections = JSON.parse(exam.sections || "[]");
  } catch {
    sections = [];
  }

  // If already submitted/graded, return limited info
  if (existingAttempt && existingAttempt.status !== "in_progress") {
    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        course: exam.courses,
        totalMarks: exam.total_marks,
        duration: exam.duration,
        instructions: exam.instructions,
      },
      attempt: {
        id: existingAttempt.id,
        status: existingAttempt.status,
        score: existingAttempt.status === "graded" ? existingAttempt.score : null,
        totalMarks: existingAttempt.total_marks,
        startedAt: existingAttempt.started_at,
        completedAt: existingAttempt.completed_at,
        feedback: existingAttempt.status === "graded" ? existingAttempt.feedback : null,
        sectionScores: existingAttempt.status === "graded" ? JSON.parse(existingAttempt.section_scores || "{}") : null,
      },
      canTakeExam: false,
      message: existingAttempt.status === "graded"
        ? "Your exam has been graded"
        : "Your exam has been submitted and is pending grading",
    });
  }

  // If in progress, return with remaining time
  if (existingAttempt && existingAttempt.status === "in_progress") {
    const startTime = new Date(existingAttempt.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000 / 60); // minutes
    const remaining = Math.max(0, exam.duration - elapsed);

    // Auto-submit if time expired
    if (remaining <= 0) {
      await supabase
        .from("exam_attempts")
        .update({
          status: "submitted",
          completed_at: new Date().toISOString(),
        })
        .eq("id", existingAttempt.id);

      return NextResponse.json({
        exam: {
          id: exam.id,
          title: exam.title,
          course: exam.courses,
          totalMarks: exam.total_marks,
        },
        canTakeExam: false,
        message: "Your exam time has expired and was auto-submitted",
      });
    }

    return NextResponse.json({
      exam: {
        id: exam.id,
        title: exam.title,
        course: exam.courses,
        totalMarks: exam.total_marks,
        duration: exam.duration,
        instructions: exam.instructions,
        sections: sections,
      },
      attempt: {
        id: existingAttempt.id,
        status: "in_progress",
        startedAt: existingAttempt.started_at,
        answers: JSON.parse(existingAttempt.answers || "{}"),
      },
      remainingMinutes: remaining,
      canTakeExam: true,
    });
  }

  // No attempt yet - return exam info for starting
  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      course: exam.courses,
      totalMarks: exam.total_marks,
      duration: exam.duration,
      instructions: exam.instructions,
      sectionCount: sections.length,
      sectionSummary: sections.map((s: { type: string; title: string; totalMarks: number }) => ({
        type: s.type,
        title: s.title,
        marks: s.totalMarks,
      })),
    },
    canTakeExam: true,
    canStart: true,
  });
}

// POST - Start exam or submit answers
export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const { action, answers } = body;

  // Get exam
  const { data: exam } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .eq("is_active", true)
    .single();

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Check access
  const { data: access } = await supabase
    .from("exam_access")
    .select("id")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .single();

  if (!access) {
    return NextResponse.json({ error: "You don't have access to this exam" }, { status: 403 });
  }

  // Get existing attempt
  const { data: existingAttempt } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .single();

  if (action === "start") {
    // Check if already has an attempt
    if (existingAttempt) {
      if (existingAttempt.status === "in_progress") {
        return NextResponse.json({
          message: "Exam already in progress",
          attemptId: existingAttempt.id,
        });
      }
      return NextResponse.json({ error: "You have already taken this exam" }, { status: 400 });
    }

    // Create new attempt
    const { data: newAttempt, error } = await supabase
      .from("exam_attempts")
      .insert({
        id: generateId(),
        user_id: userId,
        exam_id: examId,
        answers: "{}",
        score: 0,
        total_marks: exam.total_marks,
        passed: false,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to start exam:", error);
      return NextResponse.json({ error: "Failed to start exam" }, { status: 500 });
    }

    // Return exam with questions
    const sections = JSON.parse(exam.sections || "[]");

    return NextResponse.json({
      message: "Exam started",
      attemptId: newAttempt.id,
      startedAt: newAttempt.started_at,
      duration: exam.duration,
      sections: sections,
    });
  }

  if (action === "save") {
    // Save progress (auto-save)
    if (!existingAttempt || existingAttempt.status !== "in_progress") {
      return NextResponse.json({ error: "No active exam attempt" }, { status: 400 });
    }

    await supabase
      .from("exam_attempts")
      .update({ answers: JSON.stringify(answers) })
      .eq("id", existingAttempt.id);

    return NextResponse.json({ message: "Progress saved" });
  }

  if (action === "submit") {
    if (!existingAttempt || existingAttempt.status !== "in_progress") {
      return NextResponse.json({ error: "No active exam attempt" }, { status: 400 });
    }

    // Check time limit
    const startTime = new Date(existingAttempt.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000 / 60);

    // Allow 1 minute grace period
    if (elapsed > exam.duration + 1) {
      return NextResponse.json({ error: "Time limit exceeded" }, { status: 400 });
    }

    // Submit the exam
    await supabase
      .from("exam_attempts")
      .update({
        answers: JSON.stringify(answers),
        status: "submitted",
        completed_at: new Date().toISOString(),
      })
      .eq("id", existingAttempt.id);

    return NextResponse.json({
      message: "Exam submitted successfully",
      status: "submitted",
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
