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

    // Validate env JSON
    let envData = null;
    if (env) {
      try {
        envData = typeof env === "string" ? JSON.parse(env) : env;
      } catch (e) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON in env" },
          { status: 400 },
        );
      }
    }

    console.log("Inserting project into database");
    const insert = await db
      .insert(projects)
      .values({
        repo_url: repoUrl,
        framework: framework || "nextjs",
        env: envData,
        status: "deploying",
        database: database || "none",
      })
      .returning();

    const projectId = insert[0].id;
    console.log("Project inserted with ID:", projectId);

    // Trigger Jenkins asynchronously
    triggerJenkins(repoUrl, projectId, envData, framework).catch((e) =>
      console.error("jenkins trigger failed", e.message),
    );

    console.log("Responding to client");
    return NextResponse.json({ success: true, projectId });
  } catch (err) {
    console.error("Deploy error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}