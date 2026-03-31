import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}-${safeName}`;
  const filePath = `notes/${filename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(filePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return NextResponse.json({
    url: urlData.publicUrl,
    name: file.name,
  });
}
