import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Get all assignments with their submissions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get assignments with course info
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select(`
      *,
      courses:course_id (title)
    `)
    .order("due_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }

  // Get submissions for each assignment
  const assignmentIds = assignments?.map((a) => a.id) || [];
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select(`
      *,
      users:user_id (id, name, email)
    `)
    .in("assignment_id", assignmentIds)
    .order("submitted_at", { ascending: false });

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
      user: s.users,
    })),
  }));

  return NextResponse.json({ assignments: transformedAssignments });
}

// Create a new assignment
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, courseId, dueDate, totalMarks } = await request.json();

  if (!title || !description || !courseId || !dueDate || !totalMarks) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const { generateId } = await import("@/lib/supabase");

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      id: generateId(),
      title,
      description,
      course_id: courseId,
      due_date: dueDate,
      total_marks: totalMarks,
    })
    .select(`
      *,
      courses:course_id (title)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.course_id,
      dueDate: assignment.due_date,
      totalMarks: assignment.total_marks,
      createdAt: assignment.created_at,
      course: assignment.courses,
      submissions: [],
    },
  });
}

// Grade a submission
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, marks, feedback } = await request.json();

  if (!submissionId || marks === undefined || marks === null) {
    return NextResponse.json({ error: "Submission ID and marks are required" }, { status: 400 });
  }

  // Get submission with assignment info
  const { data: submission, error: fetchError } = await supabase
    .from("assignment_submissions")
    .select(`
      *,
      assignments:assignment_id (total_marks)
    `)
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (marks < 0 || marks > submission.assignments.total_marks) {
    return NextResponse.json(
      { error: `Marks must be between 0 and ${submission.assignments.total_marks}` },
      { status: 400 }
    );
  }

  const { data: updated, error } = await supabase
    .from("assignment_submissions")
    .update({
      marks,
      feedback: feedback || null,
      status: "graded",
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
  }

  return NextResponse.json({
    submission: {
      id: updated.id,
      userId: updated.user_id,
      assignmentId: updated.assignment_id,
      content: updated.content,
      attachments: updated.attachments,
      marks: updated.marks,
      feedback: updated.feedback,
      status: updated.status,
      submittedAt: updated.submitted_at,
    },
  });
}
