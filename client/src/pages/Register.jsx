import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { offlineRegister, setAuth } from "../lib/auth";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().includes("@") &&
      password.length >= 4 &&
      !loading
    );
  }, [name, email, password, loading]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (offlineMode) {
        offlineRegister({ name, email, password });
        nav("/welcome"); // ← only change
        return;
      }

      const data = await api("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      setAuth(data.token, data.user);
      nav("/welcome"); // ← only change

    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-lg">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-zinc-400">
            Start hosting meetings in minutes.
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2">
          <div>
            <div className="text-sm font-medium">Mode</div>
            <div className="text-xs text-zinc-500">
              {offlineMode
                ? "Offline (no backend needed)"
                : "Online (uses backend API)"}
            </div>
          </div>
          <button
            onClick={() => setOfflineMode((v) => !v)}
            className="rounded-lg border border-zinc-700 bg-zinc-950/40 px-3 py-1 text-sm hover:bg-zinc-900"
          >
            {offlineMode ? "OFFLINE" : "ONLINE"}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Name
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Email
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Password (min 4 chars)
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 outline-none focus:border-zinc-600"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </label>

          <button
            disabled={!canSubmit}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-3 py-2 font-medium"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          Already have one?{" "}
          <Link className="text-blue-400 hover:text-blue-300" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
