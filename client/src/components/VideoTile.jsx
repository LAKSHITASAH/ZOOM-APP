import React, { useEffect, useRef } from "react";

export default function VideoTile({ label, stream, muted }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream || null;
  }, [stream]);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className="h-full w-full object-cover"
      />
      <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-zinc-950/50 px-2.5 py-1 text-xs text-white backdrop-blur">
        {label}
      </div>
    </div>
  );
}
