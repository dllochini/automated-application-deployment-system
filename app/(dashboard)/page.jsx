"use client"

import React, { useState } from "react"
import { deployApp } from "@/services/apiService"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, AlertCircle, Github, Database, Code, Key, Rocket } from "lucide-react"

export default function Dashboard() {

  const [repo, setRepo] = useState("")
  const [framework, setFramework] = useState("")
  const [env, setEnv] = useState("")
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState(null)
  const [hasEnv, setHasEnv] = useState(false)
  const [database, setDatabase] = useState("none")
  const [dbUser, setDbUser] = useState("")
  const [dbPassword, setDbPassword] = useState("")

  const frameworks = [
    { id: "react", label: "React" },
    { id: "express", label: "Express.js" },
    { id: "fastapi", label: "FastAPI" },
    { id: "springboot", label: "Spring Boot" },
  ]

  const databases = [
    { id: "none", label: "None" },
    { id: "postgresql", label: "PostgreSQL" },
    { id: "mysql", label: "MySQL" },
  ]

  const isRepoValid =
    repo.trim().length > 0 &&
    /^(https:\/\/|git@)?[\w.-]+(:|\/)?[\w-]+\/[\w.-]+(\.git)?$/.test(repo.trim())
  const isEnvValid = hasEnv ? env.trim().length > 0 : true
  const isFrameworkValid = framework !== ""
  const isDbConfigValid =
    database === "none" || (dbUser.trim().length > 0 && dbPassword.trim().length > 0)
  const isFormValid = isRepoValid && isFrameworkValid && isEnvValid && isDbConfigValid

  function parseEnv(envText = "") {
  return Object.fromEntries(
    envText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && line.includes("="))
      .map(line => {
        const [key, ...rest] = line.split("=");
        return [key.trim(), rest.join("=").trim()];
      })
  );
}
  
  async function handleDeploy(e) {
  e?.preventDefault();

  if (!isFormValid) {
    setMessage({ type: "error", text: "Please fill all fields correctly before deploying." });
    return;
  }

  setLoading(true);
  setMessage({ type: "info", text: "Deployment started..." });
  setOutput(null);

  try {
    // normalize framework -> backend expects "spring" not "springboot"
    const normalizedFramework = framework === "springboot" ? "spring" : framework;

    // normalize dbType casing to match backend
    const dbTypeNormalized =
      database === "postgresql" ? "PostgreSQL" :
      database === "mysql" ? "MySQL" :
      null;

    const payload = {
      repoUrl: repo.trim(),
      framework: normalizedFramework,
      isDbInclude: database !== "none",
      dbType: database !== "none" ? dbTypeNormalized : null,
      dbUser: database !== "none" ? dbUser : null,
      dbPassword: database !== "none" ? dbPassword : null,
      env: hasEnv ? parseEnv(env) : null,
    };

    const res = await deployApp(payload);
    const json = res.data ?? {};

    // success check: backend returns id when saved
    if (json.id) {
      const url = json.publicUrl || json.url || null;

      setOutput({ url });

      setMessage({
        type: "success",
        text: url ? `Website can be accessed via ${url}` : "Deployment created (no URL returned).",
      });
    } else {
      setMessage({
        type: "error",
        text: json.error || "Unknown deployment error",
      });
    }
  } catch (err) {
    setMessage({
      type: "error",
      text: err.response?.data?.error || err.message || "Network error",
    });
  } finally {
    setLoading(false);
  }
}

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard" })
    setTimeout(() => setMessage(null), 1800)
  }

  return (

    <main className="min-h-screen p-6 bg-blue-950 text-white flex justify-center">

      <div className="w-full max-w-4xl space-y-8">

        <div>
          <h1 className="text-4xl font-bold mb-2">
            Automated Deployment System
          </h1>

          <p className="text-sm text-slate-300">
            Deploy your project to our Linux server easily. Provide the Git repository,
            choose the framework, configure database if required and deploy instantly.
          </p>
        </div>

        <form
          onSubmit={handleDeploy}
          className="space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
        >

          {/* Project Source */}

          <div className="space-y-4">

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Github size={18} />
              Project Source
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">

              {/* Repo */}

              <div className="flex-1">

                <label className="flex items-center gap-2 text-sm mb-1">
                  <Github size={14} /> Repo URL
                </label>

                <input
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:ring-2 focus:ring-indigo-400"
                />

                {!isRepoValid && repo && (
                  <p className="text-rose-300 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Invalid Git URL
                  </p>
                )}

              </div>

              {/* Framework */}

              <div className="w-[200px]">

                <label className="flex items-center gap-2 text-sm mb-1">
                  <Code size={14} /> Framework
                </label>

                <DropdownMenu>

                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full text-left h-10">
                      {framework
                        ? frameworks.find(f => f.id === framework)?.label
                        : "Select framework"}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-[200px] bg-white/90 text-black">

                    <DropdownMenuLabel>Select Framework</DropdownMenuLabel>

                    <DropdownMenuGroup>
                      {frameworks.map(f => (
                        <DropdownMenuItem
                          key={f.id}
                          onClick={() => setFramework(f.id)}
                        >
                          {f.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>

                  </DropdownMenuContent>

                </DropdownMenu>

              </div>

            </div>

          </div>

          {/* INFRASTRUCTURE */}

          <div className="space-y-4">

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database size={18} />
              Infrastructure
            </h2>

            <div className="space-y-2">

              <div className="flex items-center gap-2">

                <label className="text-sm font-medium">
                  Database:
                </label>

                <p className="text-xs text-slate-300">
                  Choose a database if your application requires one.
                  Select <b>None</b> if your project does not use a local database.
                </p>

              </div>

              <DropdownMenu>

                <DropdownMenuTrigger asChild>

                  <Button variant="outline" className="w-[200px] text-left h-10">
                    {databases.find(d => d.id === database)?.label}
                  </Button>

                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[200px] bg-white/90 text-black">

                  <DropdownMenuLabel>Select Database</DropdownMenuLabel>

                  <DropdownMenuGroup>
                    {databases.map((d) => (
                      <DropdownMenuItem
                        key={d.id}
                        onClick={() => {
                          setDatabase(d.id)
                          if (d.id === "none") {
                            setDbUser("")
                            setDbPassword("")
                          }
                        }}
                      >
                        {d.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>

          </div>

          {database !== "none" && (

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

              {/* DB USERNAME */}

              <div>

                <label className="text-sm mb-1 block">
                  Database Username
                </label>

                <input
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  placeholder="db_user"
                  className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:ring-2 focus:ring-indigo-400"
                />

              </div>

              {/* DB PASSWORD */}

              <div>

                <label className="text-sm mb-1 block">
                  Database Password
                </label>

                <input
                  type="password"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  placeholder="db_password"
                  className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:ring-2 focus:ring-indigo-400"
                />

              </div>

            </div>

          )}

          {/* ENV VARIABLES */}

          <div className="space-y-3">

            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key size={18} />
              Environment Variables
            </h2>

            <div className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={hasEnv}
                onChange={(e) => {
                  setHasEnv(e.target.checked)
                  if (!e.target.checked) setEnv("")
                }}
              />

              <label className="text-sm">
                This project requires environment variables
              </label>

            </div>

            <textarea
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              rows={6}
              disabled={!hasEnv}
              placeholder={`API_KEY=123\nDATABASE_URL=postgres://...`}
              className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />

            {hasEnv && !isEnvValid && (
              <p className="text-rose-300 text-xs">
                Environment variables cannot be empty
              </p>
            )}

          </div>

          {/* DEPLOY BUTTON */}

          <Button
            type="submit"
            className="w-full text-lg py-6 flex items-center justify-center gap-2"
            disabled={loading || !isFormValid}
          >

            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Deploy Project
              </>
            )}

          </Button>

          {/* MESSAGE */}

          {message && (
            <div
              className={`p-2 rounded-md text-sm ${message.type === "error"
                ? "bg-rose-900 text-rose-100"
                : message.type === "success"
                  ? "bg-emerald-900 text-emerald-100"
                  : "bg-white/20 text-white"
                }`}
            >
              {message.text}
            </div>
          )}

          {/* RESULT CARD */}

          {output && (

            <div className="p-4 bg-white/10 rounded-xl border border-white/20 space-y-2">

              <h3 className="font-semibold text-lg">
                Deployment Successful 🎉
              </h3>

              <div className="flex items-center gap-2">

                <span>
                  <strong>URL:</strong> {output.url}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(output.url)}
                >
                  <Copy size={14} />
                </Button>

              </div>

            </div>

          )}

        </form>

      </div>

    </main>
  )
}