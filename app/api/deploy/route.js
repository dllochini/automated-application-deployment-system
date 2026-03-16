import { NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
// import { allocatePort } from "@/lib/portAllocator";
import { triggerJenkins } from "@/lib/jenkins";

export async function POST(req) {
  try {
    console.log("Received deploy request");
    const body = await req.json();
    const { repoUrl, framework, env, database } = body;
    if (!repoUrl)
      return NextResponse.json(
        { success: false, error: "repoUrl required" },
        { status: 400 },
      );

    // const port = await allocatePort();
    console.log("Inserting project into database");
    const insert = await db
      .insert(projects)
      .values({
        repo_url: repoUrl,
        framework: framework || "nextjs",
        env: env,// <-- ensure JSON string
        status: "deploying",
        database: database || "none",
      })
      .returning();

    const projectId = insert[0].id;

    console.log("Project inserted with ID:", projectId);
    // trigger jenkins but don't await too long
    triggerJenkins(repoUrl, projectId, env, framework).catch((e) =>
      console.error("jenkins trigger failed", e.message),
    );

    console.log("Responding to client");
    return NextResponse.json({ success: true, projectId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
