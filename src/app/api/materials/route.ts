import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { readFile } from "fs/promises";
import path from "path";

// Map course IDs to their material filenames
const COURSE_MATERIALS: Record<string, { filename: string; label: string }> = {
  "course-ppttc": { filename: "ppttc.pdf", label: "PPTTC Course Material" },
  "course-deled": { filename: "deled.pdf", label: "D.El.Ed Course Material" },
};

// GET /api/materials?courseId=xxx — serve the PDF
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { id: string; role: string };
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  // If no courseId, return list of enrolled courses that have materials
  if (!courseId) {
    if (user.role === "admin") {
      // Admin can see all materials
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", Object.keys(COURSE_MATERIALS));

      return NextResponse.json({
        materials: courses?.map((c) => ({
          courseId: c.id,
          courseTitle: c.title,
          label: COURSE_MATERIALS[c.id].label,
        })),
      });
    }

    // Student: only show enrolled course materials
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses:course_id (id, title)
      `)
      .eq("user_id", user.id);

    const materials = enrollments
      ?.filter((e) => COURSE_MATERIALS[e.course_id])
      .map((e) => ({
        courseId: e.courses.id,
        courseTitle: e.courses.title,
        label: COURSE_MATERIALS[e.course_id].label,
      }));

    return NextResponse.json({ materials });
  }

  // Serve specific PDF
  const material = COURSE_MATERIALS[courseId];
  if (!material) {
    return NextResponse.json({ error: "No material available for this course" }, { status: 404 });
  }

  // Check enrollment (admin bypasses)
  if (user.role !== "admin") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
    }
  }

  try {
    const filePath = path.join(process.cwd(), "materials", material.filename);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${material.filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Material file not found" }, { status: 500 });
  }
}
