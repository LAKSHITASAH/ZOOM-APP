import React from "react";

export default function TopBar({ code, title, onCopy }) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950/30">
      <div>
        <div className="text-sm font-semibold">{title || "Meeting"}</div>
        <div className="text-xs text-zinc-400">Code: {code}</div>
      </div>
      <button onClick={onCopy} className="rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 px-3 py-2 text-sm">
        Copy invite link
      </button>
    </div>
  );
}
