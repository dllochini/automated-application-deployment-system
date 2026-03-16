import axios from "axios";

const JENKINS_URL = process.env.JENKINS_URL;
const JENKINS_JOB = process.env.JENKINS_JOB_NAME || "deploy-app";
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

if (!JENKINS_URL || !JENKINS_USER || !JENKINS_TOKEN) {
  // we don't throw here because sometimes devs may not want to trigger jenkins locally
}

export async function triggerJenkins(repo, projectId, env, framework) {
  try {
    console.log("Triggering Jenkins with repo:", repo, "projectId:", projectId);
    const url = `${JENKINS_URL}/job/${encodeURIComponent(JENKINS_JOB)}/buildWithParameters`;

    console.log("Jenkins URL:", url);
    const params = new URLSearchParams();
    params.append("REPO", repo);
    // params.append("PORT", String(port));
    params.append("ENV", Buffer.from(env).toString("base64"));
     params.append("FRAMEWORK", framework);
    if (projectId) params.append("PROJECT_ID", String(projectId));

    const auth = {
      username: JENKINS_USER,
      password: JENKINS_TOKEN,
    };

    console.log("Sending request to Jenkins with params:", params.toString());
    await axios.post(url, params, {
      auth,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10000,
    });

    console.log("Jenkins triggered successfully");
  } catch (err) {
    console.error("Failed to trigger Jenkins:", err.message);
  }
}
