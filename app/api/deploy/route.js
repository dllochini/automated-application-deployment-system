import { NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { allocatePort } from "@/lib/portAllocator";
import { triggerJenkins } from "@/lib/jenkins";

export async function POST(req) {
  try {
    const body = await req.json();
    const { repoUrl, framework, env } = body;
    if (!repoUrl)
      return NextResponse.json(
        { success: false, error: "repoUrl required" },
        { status: 400 },
      );

    const port = await allocatePort();

    const insert = await db
      .insert(projects)
      .values({
        repo_url: repoUrl,
        framework: framework || "nextjs",
        port,
        env: env,
        status: "deploying",
      })
      .returning();

    const projectId = insert[0].id;

    // trigger jenkins but don't await too long
    triggerJenkins(repoUrl, port, projectId, env, framework).catch((e) =>
      console.error("jenkins trigger failed", e.message),
    );

    return NextResponse.json({ success: true, port, projectId,  });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
