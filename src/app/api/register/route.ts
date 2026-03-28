import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, generateId } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, courseInterested } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        id: generateId(),
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        course_interested: courseInterested || null,
      })
      .select("id, name, email")
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
