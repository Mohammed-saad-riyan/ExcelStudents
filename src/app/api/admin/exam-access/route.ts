import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

// GET - List all exam access grants for a specific exam
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ error: "Exam ID required" }, { status: 400 });
  }

  // Get exam details
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*, courses:course_id (id, title)")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Get students enrolled in this course
  const { data: enrolledStudents } = await supabase
    .from("enrollments")
    .select(`
      user_id,
      users:user_id (id, name, email, approved)
    `)
    .eq("course_id", exam.course_id);

  // Get students who have access to this exam
  const { data: accessGrants } = await supabase
    .from("exam_access")
    .select("user_id, granted_at")
    .eq("exam_id", examId);

  const accessMap = new Map(accessGrants?.map(a => [a.user_id, a.granted_at]) || []);

  // Get exam attempts for this exam
  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("id, user_id, status, score, total_marks, started_at, completed_at")
    .eq("exam_id", examId);

  const attemptMap = new Map(attempts?.map(a => [a.user_id, a]) || []);

  // Transform data - handle Supabase's foreign key relation typing
  type UserData = { id: string; name: string; email: string; approved: boolean };

  const students = enrolledStudents
    ?.filter(e => {
      const user = e.users as unknown as UserData | UserData[] | null;
      if (!user) return false;
      const userData = Array.isArray(user) ? user[0] : user;
      return userData?.approved;
    })
    .map(e => {
      const userRaw = e.users as unknown as UserData | UserData[];
      const user = Array.isArray(userRaw) ? userRaw[0] : userRaw;
      const attempt = attemptMap.get(user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        hasAccess: accessMap.has(user.id),
        grantedAt: accessMap.get(user.id) || null,
        attempt: attempt ? {
          id: attempt.id,
          status: attempt.status || 'submitted',
          score: attempt.score,
          totalMarks: attempt.total_marks,
          startedAt: attempt.started_at,
          completedAt: attempt.completed_at,
        } : null,
      };
    }) || [];

  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      course: exam.courses,
      totalMarks: exam.total_marks,
      duration: exam.duration,
    },
    students,
  });
}

// POST - Grant access to students
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId, userIds } = await request.json();

  if (!examId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "Exam ID and user IDs required" }, { status: 400 });
  }

  const adminId = (session.user as { id: string }).id;

  // Insert access grants (ignore duplicates)
  const grants = userIds.map(userId => ({
    id: generateId(),
    exam_id: examId,
    user_id: userId,
    granted_by: adminId,
  }));

  const { error } = await supabase
    .from("exam_access")
    .upsert(grants, { onConflict: "exam_id,user_id" });

  if (error) {
    console.error("Failed to grant access:", error);
    return NextResponse.json({ error: "Failed to grant access" }, { status: 500 });
  }

  return NextResponse.json({ message: "Access granted successfully", count: userIds.length });
}

// DELETE - Revoke access from a student
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");
  const userId = searchParams.get("userId");

  if (!examId || !userId) {
    return NextResponse.json({ error: "Exam ID and User ID required" }, { status: 400 });
  }

  // Check if student has already started the exam
  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("id")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .single();

  if (attempt) {
    return NextResponse.json({ error: "Cannot revoke access - student has already started the exam" }, { status: 400 });
  }

  await supabase
    .from("exam_access")
    .delete()
    .eq("exam_id", examId)
    .eq("user_id", userId);

  return NextResponse.json({ message: "Access revoked" });
}
