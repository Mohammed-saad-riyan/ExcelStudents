import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch notes with course info
  const { data: notes, error } = await supabase
    .from("class_notes")
    .select("*, courses(id, title)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }

  // Fetch all courses for the dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });

  // Transform to camelCase
  const transformedNotes = notes?.map((n) => ({
    id: n.id,
    courseId: n.course_id,
    courseName: n.courses?.title || null,
    title: n.title,
    content: n.content,
    pdfUrl: n.pdf_url,
    pdfName: n.pdf_name,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }));

  return NextResponse.json({
    notes: transformedNotes,
    courses: courses || [],
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, pdfUrl, pdfName, courseId } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const { data: note, error } = await supabase
    .from("class_notes")
    .insert({
      id: generateId(),
      title,
      content,
      pdf_url: pdfUrl || null,
      pdf_name: pdfName || null,
      course_id: courseId || null,
    })
    .select("*, courses(id, title)")
    .single();

  if (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }

  return NextResponse.json({
    note: {
      id: note.id,
      courseId: note.course_id,
      courseName: note.courses?.title || null,
      title: note.title,
      content: note.content,
      pdfUrl: note.pdf_url,
      pdfName: note.pdf_name,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId, title, content, pdfUrl, pdfName, courseId } = await request.json();

  if (!noteId) {
    return NextResponse.json({ error: "Note ID required" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (pdfUrl !== undefined) data.pdf_url = pdfUrl || null;
  if (pdfName !== undefined) data.pdf_name = pdfName || null;
  if (courseId !== undefined) data.course_id = courseId || null;

  const { data: note, error } = await supabase
    .from("class_notes")
    .update(data)
    .eq("id", noteId)
    .select("*, courses(id, title)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }

  return NextResponse.json({
    note: {
      id: note.id,
      courseId: note.course_id,
      courseName: note.courses?.title || null,
      title: note.title,
      content: note.content,
      pdfUrl: note.pdf_url,
      pdfName: note.pdf_name,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    },
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("id");

  if (!noteId) {
    return NextResponse.json({ error: "Note ID required" }, { status: 400 });
  }

  // Get the note first to check if it has a PDF
  const { data: note } = await supabase
    .from("class_notes")
    .select("pdf_url")
    .eq("id", noteId)
    .single();

  // Delete the PDF from storage if it exists
  if (note?.pdf_url && note.pdf_url.includes("supabase")) {
    const urlParts = note.pdf_url.split("/uploads/");
    if (urlParts[1]) {
      await supabase.storage.from("uploads").remove([urlParts[1]]);
    }
  }

  await supabase.from("class_notes").delete().eq("id", noteId);
  return NextResponse.json({ message: "Note deleted" });
}
