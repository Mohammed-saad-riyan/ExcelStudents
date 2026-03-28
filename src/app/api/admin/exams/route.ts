import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get exams with course info
  const { data: exams, error } = await supabase
    .from("exams")
    .select(`
      *,
      courses:course_id (id, title)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }

  // Get attempt counts for each exam
  const examIds = exams?.map((e) => e.id) || [];
  const { data: attemptCounts } = await supabase
    .from("exam_attempts")
    .select("exam_id")
    .in("exam_id", examIds);

  const countMap: Record<string, number> = {};
  attemptCounts?.forEach((a) => {
    countMap[a.exam_id] = (countMap[a.exam_id] || 0) + 1;
  });

  // Transform exams
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
    _count: { attempts: countMap[e.id] || 0 },
  }));

  // Get courses for dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  return NextResponse.json({ exams: transformedExams, courses });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, title, description, courseId } = body;

  if (!title || !description || !courseId || !type) {
    return NextResponse.json({ error: "Title, description, course, and type are required" }, { status: 400 });
  }

  if (type === "final") {
    const { formUrl } = body;
    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        id: generateId(),
        type: "final",
        title,
        description,
        course_id: courseId,
        form_url: formUrl || null,
        duration: 0,
        total_marks: 0,
        passing_marks: 0,
        questions: "[]",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
    }

    return NextResponse.json({ exam });
  }

  // MCQ exam
  const { duration, totalMarks, passingMarks, questions } = body;

  if (!duration || !totalMarks || !passingMarks || !questions || !questions.length) {
    return NextResponse.json({ error: "MCQ exams need duration, marks, and questions" }, { status: 400 });
  }

  const { data: exam, error } = await supabase
    .from("exams")
    .insert({
      id: generateId(),
      type: "mcq",
      title,
      description,
      course_id: courseId,
      duration,
      total_marks: totalMarks,
      passing_marks: passingMarks,
      questions: JSON.stringify(questions),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }

  return NextResponse.json({ exam });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId, isActive, formUrl } = await request.json();

  if (!examId) {
    return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (isActive !== undefined) data.is_active = isActive;
  if (formUrl !== undefined) data.form_url = formUrl;

  const { data: exam, error } = await supabase
    .from("exams")
    .update(data)
    .eq("id", examId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }

  return NextResponse.json({ exam });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("id");

  if (!examId) {
    return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
  }

  await supabase.from("exam_attempts").delete().eq("exam_id", examId);
  await supabase.from("exams").delete().eq("id", examId);

  return NextResponse.json({ message: "Exam deleted" });
}
