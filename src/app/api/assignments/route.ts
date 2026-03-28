import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  // Get assignments with course info
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select(`
      *,
      courses:course_id (title)
    `)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }

  // Get user's submissions
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("user_id", userId);

  // Group submissions by assignment
  type SubmissionType = NonNullable<typeof submissions>[number];
  const submissionMap: Record<string, SubmissionType[]> = {};
  submissions?.forEach((s) => {
    if (!submissionMap[s.assignment_id]) {
      submissionMap[s.assignment_id] = [];
    }
    submissionMap[s.assignment_id].push(s);
  });

  // Transform assignments
  const transformedAssignments = assignments?.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    courseId: a.course_id,
    dueDate: a.due_date,
    totalMarks: a.total_marks,
    attachments: a.attachments,
    createdAt: a.created_at,
    course: a.courses,
    submissions: (submissionMap[a.id] || []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      assignmentId: s.assignment_id,
      content: s.content,
      attachments: s.attachments,
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
      submittedAt: s.submitted_at,
    })),
  }));

  return NextResponse.json(transformedAssignments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId, content } = await request.json();

  const { data: submission, error } = await supabase
    .from("assignment_submissions")
    .insert({
      id: generateId(),
      user_id: (session.user as { id: string }).id,
      assignment_id: assignmentId,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }

  return NextResponse.json({
    id: submission.id,
    userId: submission.user_id,
    assignmentId: submission.assignment_id,
    content: submission.content,
    attachments: submission.attachments,
    marks: submission.marks,
    feedback: submission.feedback,
    status: submission.status,
    submittedAt: submission.submitted_at,
  });
}
