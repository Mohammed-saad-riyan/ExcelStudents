import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// All authenticated users can see all notes
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: notes, error } = await supabase
    .from("class_notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }

  // Transform to camelCase
  const transformedNotes = notes?.map((n) => ({
    id: n.id,
    courseId: n.course_id,
    title: n.title,
    content: n.content,
    pdfUrl: n.pdf_url,
    pdfName: n.pdf_name,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }));

  return NextResponse.json({ notes: transformedNotes });
}
