import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

export async function GET() {
  const { data: feedbacks, error } = await supabase
    .from("feedback")
    .select(`
      *,
      users:user_id (name, avatar)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }

  // Transform to match frontend expectations
  const transformedFeedbacks = feedbacks?.map((f) => ({
    id: f.id,
    userId: f.user_id,
    subject: f.subject,
    message: f.message,
    rating: f.rating,
    category: f.category,
    createdAt: f.created_at,
    user: f.users,
  }));

  return NextResponse.json(transformedFeedbacks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message, rating, category } = await request.json();

  if (!subject || !message || !rating || !category) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      id: generateId(),
      user_id: (session.user as { id: string }).id,
      subject,
      message,
      rating: parseInt(rating),
      category,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }

  return NextResponse.json({
    id: feedback.id,
    userId: feedback.user_id,
    subject: feedback.subject,
    message: feedback.message,
    rating: feedback.rating,
    category: feedback.category,
    createdAt: feedback.created_at,
  });
}
