"use client"

import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, AlertCircle } from "lucide-react"

export default function Dashboard() {
  const [repo, setRepo] = useState("")
  const [framework, setFramework] = useState("")
  const [env, setEnv] = useState("")
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState(null)
  const [hasEnv, setHasEnv] = useState(false)
  const [database, setDatabase] = useState("none")

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

  const isRepoValid = repo.trim().length > 0 && /^(https:\/\/|git@)?[\w.-]+(:|\/)?[\w-]+\/[\w.-]+(\.git)?$/.test(repo.trim())
  const isEnvValid = hasEnv ? env.trim().length > 0 : true
  const isFrameworkValid = framework !== ""
  const isFormValid = isRepoValid && isFrameworkValid && isEnvValid

  async function handleDeploy(e) {
    e?.preventDefault()
    if (!isFormValid) {
      setMessage({ type: "error", text: "Please fill all fields correctly before deploying." })
      return
    }

    setLoading(true)
    setMessage({ type: "info", text: "Deployment started..." })
    setOutput(null)

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repo.trim(),
          framework,
          env: hasEnv ? env : null,
          database,
        }),
      })
      const json = await res.json()

      if (json.success) {
        setOutput({ port: json.port, url: json.url })
        setMessage({ type: "success", text: `Deployment completed on port ${json.port}` })
        // setRepo("")
        // setFramework("")
        // setEnv("")
      } else {
        setMessage({ type: "error", text: json.error || "Unknown deployment error" })
      }
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setMessage({ type: "success", text: "Copied to clipboard" })
    setTimeout(() => setMessage(null), 1800)
  }

  return (
    <main className="min-h-screen p-6 bg-blue-950 text-white flex items-start justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold mb-4">Automated Deployment System</h1>
        <p className="text-sm text-slate-300 mb-6">
          Deploy your project to our Linux server easily. Provide the Git repo URL, select the framework, and add environment variables.
        </p>

        <form onSubmit={handleDeploy} className="space-y-4 bg-white/10 p-6 rounded-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Repo URL</label>
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {!isRepoValid && repo && (
                <p className="text-rose-300 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> Invalid Git URL</p>
              )}
            </div>

            <div className="w-[180px]">
              <label className="block text-sm mb-1">Framework</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left h-10">
                    {framework ? frameworks.find(f => f.id === framework)?.label : "Select a framework"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px] bg-white/90 text-black">
                  <DropdownMenuLabel>Select Framework</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {frameworks.map(f => (
                      <DropdownMenuItem key={f.id} onClick={() => setFramework(f.id)}>{f.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="w-[180px]">
            <label className="block text-sm mb-1">Database</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full text-left h-10">
                  {database ? databases.find(d => d.id === database)?.label : "Select a database"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px] bg-white/90 text-black">
                <DropdownMenuLabel>Select Database</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {databases.map(d => (
                    <DropdownMenuItem key={d.id} onClick={() => setDatabase(d.id)}>{d.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-xs text-slate-300 mt-1">
              Choose a database for your project. Select "None" if no database is needed.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={hasEnv}
                onChange={(e) => {
                  setHasEnv(e.target.checked)
                  if (!e.target.checked) setEnv("")
                }}
              />
              <label className="text-sm">This project requires environment variables</label>
            </div>

            <label className="block text-sm mb-1">Environment Variables</label>

            <textarea
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              rows={6}
              disabled={!hasEnv}
              placeholder={`API_KEY=123\nDATABASE_URL=postgres://...`}
              className="w-full px-3 py-2 rounded-md border border-white/20 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />

            {hasEnv && !isEnvValid && (
              <p className="text-rose-300 text-xs mt-1">
                Environment variables cannot be empty
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
            {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Deploying...</span> : "Deploy"}
          </Button>

          {message && (
            <div className={`mt-2 p-2 rounded-md text-sm ${message.type === "error" ? "bg-rose-900 text-rose-100" : message.type === "success" ? "bg-emerald-900 text-emerald-100" : "bg-white/20 text-white"}`}>{message.text}</div>
          )}

          {output && (
            <div className="mt-4 p-4 bg-white/10 rounded-md border border-white/20">
              <p><strong>Port:</strong> {output.port}</p>
              <p className="flex items-center gap-2">
                <strong>URL:</strong> {output.url}
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(output.url)}><Copy size={14} /></Button>
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}