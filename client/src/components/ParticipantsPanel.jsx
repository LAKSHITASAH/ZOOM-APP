import React from "react";

export default function ParticipantsPanel({ participants }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-zinc-800 text-sm font-medium">
        Participants ({participants.length})
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {participants.map((p) => (
          <div key={p.socketId} className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2">
            <div className="text-sm">{p.name}</div>
            <div className="text-xs text-zinc-500">{p.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
