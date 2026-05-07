import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  const { data: exam, error } = await supabase
    .from("exams")
    .select(`
      *,
      courses:course_id (id, title)
    `)
    .eq("id", examId)
    .single();

  if (error || !exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Parse sections if they exist
  let sections = [];
  try {
    sections = exam.sections ? JSON.parse(exam.sections) : [];
  } catch {
    sections = [];
  }

  const transformedExam = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    courseId: exam.course_id,
    type: exam.type,
    examType: exam.exam_type || exam.type,
    duration: exam.duration,
    totalMarks: exam.total_marks,
    passingMarks: exam.passing_marks,
    sections,
    instructions: exam.instructions,
    formUrl: exam.form_url,
    isActive: exam.is_active,
    createdAt: exam.created_at,
    course: exam.courses,
  };

  // Get courses for dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  return NextResponse.json({ exam: transformedExam, courses });
}
