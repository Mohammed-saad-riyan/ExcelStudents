import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET - Get all submissions for an exam (for grading)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");
  const submissionId = searchParams.get("submissionId");

  // If submissionId provided, get single submission with full details
  if (submissionId) {
    const { data: submission, error } = await supabase
      .from("exam_attempts")
      .select(`
        *,
        users:user_id (id, name, email),
        exams:exam_id (id, title, sections, total_marks, duration, course_id)
      `)
      .eq("id", submissionId)
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const exam = submission.exams as { sections: string; total_marks: number };
    const sections = JSON.parse(exam.sections || "[]");
    const answers = JSON.parse(submission.answers || "{}");
    const sectionScores = JSON.parse(submission.section_scores || "{}");

    return NextResponse.json({
      submission: {
        id: submission.id,
        status: submission.status,
        startedAt: submission.started_at,
        completedAt: submission.completed_at,
        score: submission.score,
        totalMarks: submission.total_marks,
        feedback: submission.feedback,
        sectionScores,
        answers,
        gradedAt: submission.graded_at,
      },
      student: submission.users,
      exam: {
        id: (submission.exams as { id: string }).id,
        title: (submission.exams as { title: string }).title,
        totalMarks: exam.total_marks,
        sections,
      },
    });
  }

  // Get all submissions for an exam
  if (!examId) {
    return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
  }

  const { data: submissions, error } = await supabase
    .from("exam_attempts")
    .select(`
      id,
      status,
      score,
      total_marks,
      started_at,
      completed_at,
      graded_at,
      users:user_id (id, name, email)
    `)
    .eq("exam_id", examId)
    .neq("status", "in_progress")
    .order("completed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }

  // Get exam info
  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, total_marks, courses:course_id (title)")
    .eq("id", examId)
    .single();

  return NextResponse.json({
    exam: exam ? {
      id: exam.id,
      title: exam.title,
      totalMarks: exam.total_marks,
      course: exam.courses,
    } : null,
    submissions: submissions?.map(s => ({
      id: s.id,
      status: s.status,
      score: s.score,
      totalMarks: s.total_marks,
      startedAt: s.started_at,
      completedAt: s.completed_at,
      gradedAt: s.graded_at,
      student: s.users,
    })) || [],
  });
}

// PATCH - Grade a submission
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, sectionScores, totalScore, feedback } = await request.json();

  if (!submissionId) {
    return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
  }

  const adminId = (session.user as { id: string }).id;

  // Get submission to verify it exists and get total marks
  const { data: submission, error: fetchError } = await supabase
    .from("exam_attempts")
    .select("*, exams:exam_id (total_marks, passing_marks)")
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const exam = submission.exams as { total_marks: number; passing_marks: number };
  const passed = totalScore >= exam.passing_marks;

  // Update the submission with grades
  const { error: updateError } = await supabase
    .from("exam_attempts")
    .update({
      status: "graded",
      score: totalScore,
      passed,
      section_scores: JSON.stringify(sectionScores),
      feedback: feedback || null,
      graded_at: new Date().toISOString(),
      graded_by: adminId,
    })
    .eq("id", submissionId);

  if (updateError) {
    console.error("Failed to grade submission:", updateError);
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 });
  }

  return NextResponse.json({
    message: "Grades saved successfully",
    score: totalScore,
    passed,
  });
}
