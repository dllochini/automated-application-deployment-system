import { NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, containerId, status, url } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "projectId required" },
        { status: 400 }
      );
    }

    await db
      .update(projects)
      .set({
        container_id: containerId,
        status: status || "running",
        public_url: url
      })
      .where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}