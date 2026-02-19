import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Prejoin() {
  const { code } = useParams();
  const roomCode = String(code || "").trim().toUpperCase();
  const nav = useNavigate();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!alive) return;
        setPreview(s);
      } catch (e) {
        setErr("Camera/mic permission denied.");
      }
    })();
    return () => {
      alive = false;
      if (preview) preview.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go() {
    nav(`/room/${roomCode}`, { state: { micOn, camOn } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-white">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="text-xl font-bold">Pre-join</div>
        <div className="mt-1 text-sm text-zinc-400">Room: {roomCode}</div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
            <VideoPreview stream={preview} />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setMicOn((v) => !v)}
                className={[
                  "flex-1 rounded-2xl px-4 py-2 text-sm font-semibold border",
                  micOn ? "bg-white text-zinc-950 border-white/10" : "bg-rose-500/10 text-rose-200 border-rose-500/30",
                ].join(" ")}
              >
                {micOn ? "Mic on" : "Mic off"}
              </button>
              <button
                onClick={() => setCamOn((v) => !v)}
                className={[
                  "flex-1 rounded-2xl px-4 py-2 text-sm font-semibold border",
                  camOn ? "bg-white text-zinc-950 border-white/10" : "bg-rose-500/10 text-rose-200 border-rose-500/30",
                ].join(" ")}
              >
                {camOn ? "Cam on" : "Cam off"}
              </button>
            </div>
            {err ? <div className="mt-3 text-xs text-rose-300">{err}</div> : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="text-lg font-semibold">Ready to join?</div>
            <div className="mt-2 text-sm text-zinc-300">
              You can toggle mic/cam now. You can also screen share and chat inside the room.
            </div>

            <button
              onClick={go}
              className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
            >
              Join meeting
            </button>

            <div className="mt-4 text-xs text-zinc-500">
              Tip: Use Incognito/Edge for 2nd user on same laptop.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ stream }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
        ref={(el) => {
          if (el) el.srcObject = stream || null;
        }}
      />
    </div>
  );
}
