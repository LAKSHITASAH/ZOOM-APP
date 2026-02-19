import React, { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 bg-zinc-950/30 p-3">
            <div className="text-xs text-zinc-400">{m.from?.name || "Guest"}</div>
            <div className="mt-1 text-sm text-zinc-100">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-white/10 p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-2 text-sm outline-none focus:border-white/20"
        />
        <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
          Send
        </button>
      </form>
    </div>
  );
}
