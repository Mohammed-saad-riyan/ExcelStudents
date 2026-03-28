import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

// Get all students (with optional filter)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter"); // "pending" | "approved" | "all"

  let query = supabase
    .from("users")
    .select("id, name, email, phone, course_interested, approved, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("approved", false);
  if (filter === "approved") query = query.eq("approved", true);

  const { data: students, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }

  // Get counts
  const { count: total } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: pending } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("approved", false);

  const { count: approved } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("approved", true);

  // Transform snake_case to camelCase for frontend compatibility
  const transformedStudents = students?.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    courseInterested: s.course_interested,
    approved: s.approved,
    createdAt: s.created_at,
  }));

  return NextResponse.json({
    students: transformedStudents,
    counts: { total: total || 0, pending: pending || 0, approved: approved || 0 },
  });
}

// Approve or reject a student
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, action } = await request.json();

  if (!studentId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "approve") {
    const { data: student, error } = await supabase
      .from("users")
      .update({ approved: true })
      .eq("id", studentId)
      .select("id, name, email, approved, course_interested")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to approve student" }, { status: 500 });
    }

    // Auto-enroll in the course they selected during registration
    if (student.course_interested) {
      const courseMap: Record<string, string> = {
        PPTTC: "course-ppttc",
        Montessori: "course-montessori",
        ECCE: "course-ecce",
        "D.El.Ed": "course-deled",
      };
      const courseId = courseMap[student.course_interested];
      if (courseId) {
        // Check if course exists
        const { data: course } = await supabase
          .from("courses")
          .select("id")
          .eq("id", courseId)
          .single();

        if (course) {
          // Check if already enrolled
          const { data: existing } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", student.id)
            .eq("course_id", courseId)
            .single();

          if (!existing) {
            await supabase.from("enrollments").insert({
              id: generateId(),
              user_id: student.id,
              course_id: courseId,
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: "Student approved",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        approved: student.approved,
        courseInterested: student.course_interested,
      },
    });
  }

  if (action === "reject") {
    await supabase.from("users").delete().eq("id", studentId);
    return NextResponse.json({ message: "Student rejected and removed" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Remove an approved student
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("id");

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  // Delete related records first (cascade should handle this but being explicit)
  await supabase.from("attendance").delete().eq("user_id", studentId);
  await supabase.from("exam_attempts").delete().eq("user_id", studentId);
  await supabase.from("assignment_submissions").delete().eq("user_id", studentId);
  await supabase.from("feedback").delete().eq("user_id", studentId);
  await supabase.from("enrollments").delete().eq("user_id", studentId);
  await supabase.from("users").delete().eq("id", studentId);

  return NextResponse.json({ message: "Student removed successfully" });
}
