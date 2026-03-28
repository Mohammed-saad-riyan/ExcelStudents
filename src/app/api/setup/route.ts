import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, generateId } from "@/lib/supabase";

// Check if admin exists
export async function GET() {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  return NextResponse.json({ adminExists: (count || 0) > 0 });
}

// Built-in admin account details
const ADMIN_NAME = "Afroze Sultana";
const ADMIN_EMAIL = "afrozesultana1@gmail.com";

// Create admin account (only works if no admin exists yet)
export async function POST(request: Request) {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count || 0) > 0) {
    return NextResponse.json({ error: "Admin account already exists" }, { status: 400 });
  }

  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const { data: admin, error } = await supabase
      .from("users")
      .insert({
        id: generateId(),
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        approved: true,
      })
      .select("email")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
    }

    return NextResponse.json({ message: "Admin account created", email: admin.email });
  } catch {
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
  }
}
