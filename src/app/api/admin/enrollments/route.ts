import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

// Get enrollments for a student
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (studentId) {
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses:course_id (id, title)
      `)
      .eq("user_id", studentId);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
    }

    // Transform to match frontend expectations
    const transformedEnrollments = enrollments?.map((e) => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      enrolledAt: e.enrolled_at,
      course: e.courses,
    }));

    return NextResponse.json({ enrollments: transformedEnrollments });
  }

  // Return all courses for the enrollment form
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }

  return NextResponse.json({ courses });
}

// Enroll a student in a course
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, courseId } = await request.json();

  if (!studentId || !courseId) {
    return NextResponse.json({ error: "Student ID and Course ID required" }, { status: 400 });
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", studentId)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Student already enrolled in this course" }, { status: 400 });
  }

  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .insert({
      id: generateId(),
      user_id: studentId,
      course_id: courseId,
    })
    .select(`
      *,
      courses:course_id (id, title)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }

  return NextResponse.json({
    enrollment: {
      id: enrollment.id,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      enrolledAt: enrollment.enrolled_at,
      course: enrollment.courses,
    },
  });
}

// Remove enrollment
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get("id");

  if (!enrollmentId) {
    return NextResponse.json({ error: "Enrollment ID required" }, { status: 400 });
  }

  await supabase.from("enrollments").delete().eq("id", enrollmentId);
  return NextResponse.json({ message: "Enrollment removed" });
}
