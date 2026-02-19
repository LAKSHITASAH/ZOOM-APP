import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Plus, LogIn, Keyboard, Copy, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function makeCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function Home() {
  const nav = useNavigate();

  const [name, setName] = useState(localStorage.getItem("name") || "Guest");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Zoom-like "created meeting" state
  const [created, setCreated] = useState(null); // { code, invite }

  const canJoin = useMemo(() => code.trim().length > 0 && !loading, [code, loading]);

  function saveName() {
    localStorage.setItem("name", (name || "Guest").trim() || "Guest");
  }

  async function createMeeting() {
    setErr("");
    setCreated(null);
    setLoading(true);

    try {
      saveName();

      // try backend first
      const res = await fetch(`${API}/api/meeting`, { method: "POST" });
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();

      const meetingCode = String(data?.code || "").trim().toUpperCase();
      if (!meetingCode) throw new Error("No code returned");

      const invite = `${window.location.origin}/prejoin/${meetingCode}`;
      setCreated({ code: meetingCode, invite });

      // go to prejoin like Zoom
      nav(`/prejoin/${meetingCode}`);
    } catch (e) {
      // ✅ OFFLINE fallback (still fully functional)
      const meetingCode = makeCode(6);
      const invite = `${window.location.origin}/prejoin/${meetingCode}`;
      setCreated({ code: meetingCode, invite });
      setErr("Server not reachable — started an offline meeting code instead.");

      nav(`/prejoin/${meetingCode}`);
    } finally {
      setLoading(false);
    }
  }

  function joinMeeting() {
    setErr("");
    setCreated(null);

    const c = code.trim().toUpperCase();
    if (!c) {
      setErr("Please enter a meeting code.");
      return;
    }

    saveName();
    nav(`/prejoin/${c}`);
  }

  async function copyInvite(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      prompt("Copy invite link:", text);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] text-[#07103A]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0B5CFF] grid place-items-center shadow-sm">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div className="font-extrabold text-lg tracking-tight text-[#0B5CFF]">ZOOM</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-black/60 font-semibold">Signed in as</div>
            <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-bold">
              {(name || "Guest").trim() || "Guest"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10">
        {/* Title + name */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B1B4A]">Home</h1>
            <p className="mt-2 text-black/60 font-medium">Start a new meeting or join with a code.</p>
          </div>

          <div className="w-full sm:w-[360px]">
            <label className="text-sm font-semibold text-black/60">Display name</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
              <Keyboard className="h-4 w-4 text-black/40" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full outline-none text-sm font-semibold placeholder:text-black/35"
                placeholder="Your name"
              />
            </div>
            <div className="mt-1 text-xs text-black/45">This name shows inside the meeting.</div>
          </div>
        </div>

        {/* Errors */}
        {err ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {err}
          </div>
        ) : null}

        {/* “Meeting created” panel (Zoom-like) */}
        {created ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#0B1B4A]">Meeting ready</div>
                  <div className="text-sm text-black/70 mt-1">
                    Code: <span className="font-extrabold tracking-wider">{created.code}</span>
                  </div>
                  <div className="text-xs text-black/55 mt-1 break-all">{created.invite}</div>
                </div>
              </div>

              <button
                onClick={() => copyInvite(created.invite)}
                className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 hover:bg-black/[0.03] font-bold"
              >
                <Copy className="h-4 w-4" />
                Copy invite
              </button>
            </div>
          </div>
        ) : null}

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* New Meeting */}
          <div className="lg:col-span-2 rounded-[28px] bg-white border border-black/10 shadow-[0_25px_80px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B4A]">Start a new meeting</h2>
                  <p className="mt-2 text-sm text-black/60 font-medium">
                    Create a meeting instantly and invite others with a link.
                  </p>
                </div>

                <div className="hidden sm:block h-12 w-12 rounded-2xl bg-[#0B5CFF]/10 grid place-items-center">
                  <Plus className="h-6 w-6 text-[#0B5CFF]" />
                </div>
              </div>

              <button
                onClick={createMeeting}
                disabled={loading}
                className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-[#0B5CFF] hover:bg-[#0A4FE0] text-white font-extrabold disabled:opacity-60 transition"
              >
                {loading ? "Creating..." : "New Meeting"}
                <Video className="h-5 w-5" />
              </button>

              <div className="mt-6 text-xs text-black/45">
                If your backend is off, the app auto-creates an offline meeting code.
              </div>
            </div>
          </div>

          {/* Join */}
          <div className="rounded-[28px] bg-white border border-black/10 shadow-[0_25px_80px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-6 sm:p-7">
              <h3 className="text-xl font-extrabold text-[#0B1B4A]">Join</h3>
              <p className="mt-1 text-sm text-black/60 font-medium">Enter a meeting code to join.</p>

              <label className="mt-5 block text-sm font-semibold text-black/60">Meeting ID / Code</label>

              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ABC123"
                className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40 font-semibold tracking-wider uppercase"
              />

              <button
                onClick={joinMeeting}
                disabled={!canJoin}
                className="mt-4 w-full h-12 rounded-2xl bg-black/90 hover:bg-black text-white font-extrabold disabled:opacity-60 transition inline-flex items-center justify-center gap-2"
              >
                Join
                <LogIn className="h-5 w-5" />
              </button>

              <div className="mt-4 text-xs text-black/45">Joining opens pre-join screen for mic/cam check.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
