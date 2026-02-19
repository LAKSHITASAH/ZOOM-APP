import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import VideoTile from "../components/VideoTile.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import { RTC_CONFIG, replaceVideoTrack, stopStream } from "../lib/webrtc.js";

export default function Room() {
  const { code } = useParams();
  const roomCode = String(code || "").trim().toUpperCase();
  const nav = useNavigate();
  const location = useLocation();

  const name = (localStorage.getItem("name") || "Guest").trim() || "Guest";

  const [socketStatus, setSocketStatus] = useState("connecting…");
  const [socketErr, setSocketErr] = useState("");

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  const [micOn, setMicOn] = useState(location.state?.micOn ?? true);
  const [camOn, setCamOn] = useState(location.state?.camOn ?? true);
  const [sharing, setSharing] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const socketRef = useRef(null);
  const pcsRef = useRef(new Map());
  const shareStreamRef = useRef(null);

  // Perfect negotiation flags
  const makingOfferRef = useRef(new Map());
  const ignoreOfferRef = useRef(new Map());
  const politeRef = useRef(new Map());

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  // get mic/cam
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!alive) return;
        s.getAudioTracks().forEach((t) => (t.enabled = micOn));
        s.getVideoTracks().forEach((t) => (t.enabled = camOn));
        setLocalStream(s);
      } catch (e) {
        console.log("getUserMedia error:", e);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isPolite(myId, peerId) {
    return String(myId) < String(peerId);
  }

  async function ensurePeer(peerId) {
    const socket = socketRef.current;
    if (!socket) return null;
    if (!peerId || peerId === socket.id) return null;

    if (pcsRef.current.has(peerId)) return pcsRef.current.get(peerId);

    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcsRef.current.set(peerId, pc);

    makingOfferRef.current.set(peerId, false);
    ignoreOfferRef.current.set(peerId, false);
    politeRef.current.set(peerId, isPolite(socket.id, peerId));

    // add tracks (if available)
    if (localStream) {
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    }

    pc.ontrack = (evt) => {
      const [stream] = evt.streams;
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(peerId, stream);
        return next;
      });
    };

    pc.onicecandidate = (evt) => {
      if (evt.candidate) socket.emit("webrtc:ice", { to: peerId, candidate: evt.candidate });
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current.set(peerId, true);
        await pc.setLocalDescription(await pc.createOffer());
        socket.emit("webrtc:offer", { to: peerId, offer: pc.localDescription });
      } catch (e) {
        console.log("negotiationneeded error:", e);
      } finally {
        makingOfferRef.current.set(peerId, false);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        closePeer(peerId);
      }
    };

    return pc;
  }

  function closePeer(peerId) {
    const pc = pcsRef.current.get(peerId);
    try { pc?.close(); } catch {}
    pcsRef.current.delete(peerId);

    makingOfferRef.current.delete(peerId);
    ignoreOfferRef.current.delete(peerId);
    politeRef.current.delete(peerId);

    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }

  // connect socket
  useEffect(() => {
    setSocketStatus("connecting…");
    setSocketErr("");

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketStatus("connected");

      socket.emit("room:join", { roomCode, name }, async (res) => {
        if (!res?.ok) {
          setSocketErr(res?.error || "Join failed");
          return;
        }
        setParticipants(res.participants || []);

        // create peers for existing participants
        for (const p of res.participants || []) {
          if (p.socketId && p.socketId !== socket.id) {
            await ensurePeer(p.socketId);
          }
        }
      });
    });

    socket.on("connect_error", (e) => {
      setSocketStatus("error");
      setSocketErr(e.message || "connect_error");
    });

    socket.on("disconnect", () => setSocketStatus("disconnected"));

    socket.on("room:participants", async ({ participants: list }) => {
      const incoming = Array.isArray(list) ? list : [];
      setParticipants(incoming);
      for (const p of incoming) {
        if (p.socketId && p.socketId !== socket.id) await ensurePeer(p.socketId);
      }
    });

    socket.on("room:user-joined", async ({ user: joined }) => {
      if (!joined?.socketId) return;
      setParticipants((prev) => {
        const next = prev.filter((p) => p.socketId !== joined.socketId);
        return [...next, joined];
      });
      await ensurePeer(joined.socketId);
    });

    socket.on("room:user-left", ({ socketId }) => {
      closePeer(socketId);
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    socket.on("webrtc:offer", async ({ from, offer }) => {
      const pc = await ensurePeer(from);
      if (!pc) return;

      const polite = politeRef.current.get(from) ?? true;
      const makingOffer = makingOfferRef.current.get(from) ?? false;
      const offerCollision = makingOffer || pc.signalingState !== "stable";

      ignoreOfferRef.current.set(from, !polite && offerCollision);
      if (ignoreOfferRef.current.get(from)) return;

      try {
        await pc.setRemoteDescription(offer);
        await pc.setLocalDescription(await pc.createAnswer());
        socket.emit("webrtc:answer", { to: from, answer: pc.localDescription });
      } catch (e) {
        console.log("offer handling error:", e);
      }
    });

    socket.on("webrtc:answer", async ({ from, answer }) => {
      const pc = pcsRef.current.get(from);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(answer);
      } catch (e) {
        console.log("answer error:", e);
      }
    });

    socket.on("webrtc:ice", async ({ from, candidate }) => {
      const pc = pcsRef.current.get(from);
      if (!pc) return;
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        if (!ignoreOfferRef.current.get(from)) console.log("ICE add error", e);
      }
    });

    socket.on("chat:message", (m) => setMessages((prev) => [...prev, m]));

    return () => {
      try { socket.disconnect(); } catch {}
      for (const pc of pcsRef.current.values()) {
        try { pc.close(); } catch {}
      }
      pcsRef.current.clear();
    };
  }, [SOCKET_URL, roomCode, name, localStream]);

  // when localStream becomes available, attach tracks to any existing peer connections
  useEffect(() => {
    if (!localStream) return;
    for (const pc of pcsRef.current.values()) {
      for (const track of localStream.getTracks()) {
        const already = pc.getSenders().some((s) => s.track && s.track.kind === track.kind);
        if (!already) pc.addTrack(track, localStream);
      }
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      stopStream(shareStreamRef.current);
      stopStream(localStream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // controls
  function toggleMic() {
    const t = localStream?.getAudioTracks()?.[0];
    if (t) {
      t.enabled = !t.enabled;
      setMicOn(t.enabled);
    } else setMicOn((v) => !v);
  }

  function toggleCam() {
    const t = localStream?.getVideoTracks()?.[0];
    if (t) {
      t.enabled = !t.enabled;
      setCamOn(t.enabled);
    } else setCamOn((v) => !v);
  }

  async function startShare() {
    if (sharing) return;
    try {
      const share = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      shareStreamRef.current = share;
      setSharing(true);

      const newTrack = share.getVideoTracks()[0];
      for (const pc of pcsRef.current.values()) {
        await replaceVideoTrack(pc, newTrack);
      }
      newTrack.onended = stopShare;
    } catch (e) {
      console.log("share error:", e);
    }
  }

  async function stopShare() {
    if (!sharing) return;
    stopStream(shareStreamRef.current);
    shareStreamRef.current = null;
    setSharing(false);

    const camTrack = localStream?.getVideoTracks()?.[0];
    if (!camTrack) return;
    for (const pc of pcsRef.current.values()) {
      await replaceVideoTrack(pc, camTrack);
    }
  }

  function sendChat(text) {
    socketRef.current?.emit("chat:send", { roomCode, message: text });
  }

  function copyInvite() {
    const invite = `${window.location.origin}/prejoin/${roomCode}`;
    navigator.clipboard.writeText(invite).then(
      () => alert("Invite link copied!"),
      () => prompt("Copy invite:", invite)
    );
  }

  function leave() {
    nav("/");
  }

  const tiles = useMemo(() => {
    const list = [];
    list.push({
      key: "me",
      label: `${name} (you)`,
      stream: sharing ? shareStreamRef.current : localStream,
      muted: true,
    });

    for (const [socketId, stream] of remoteStreams.entries()) {
      const p = participants.find((x) => x.socketId === socketId);
      list.push({
        key: socketId,
        label: p?.name || "Guest",
        stream,
        muted: false,
      });
    }
    return list;
  }, [localStream, remoteStreams, participants, sharing, name]);

  const inCall = Math.max(1, participants.length);

  return (
    <div className="h-full min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Room: {roomCode}</div>
            <div className="text-xs text-zinc-400">
              Socket: {socketStatus}
              {socketErr ? <span className="text-rose-300"> — {socketErr}</span> : null}
              <span className="ml-2">Participants: {participants.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyInvite}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Copy invite link
            </button>
            <button
              onClick={leave}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold hover:bg-rose-500"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* video grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map((t) => (
            <div key={t.key} className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl aspect-video">
              <VideoTile label={t.label} stream={t.stream} muted={t.muted} />
            </div>
          ))}
        </div>

        {/* right panel */}
        <div className="hidden lg:flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Chat</div>
          <div className="min-h-0 flex-1">
            <ChatPanel messages={messages} onSend={sendChat} />
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={toggleMic}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold border",
                micOn ? "bg-white text-zinc-950 border-white/10" : "bg-rose-500/10 text-rose-200 border-rose-500/30",
              ].join(" ")}
            >
              {micOn ? "Mute" : "Unmute"}
            </button>

            <button
              onClick={toggleCam}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold border",
                camOn ? "bg-white text-zinc-950 border-white/10" : "bg-rose-500/10 text-rose-200 border-rose-500/30",
              ].join(" ")}
            >
              {camOn ? "Stop video" : "Start video"}
            </button>

            <button
              onClick={sharing ? stopShare : startShare}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold border",
                sharing
                  ? "bg-amber-400/10 text-amber-200 border-amber-400/30"
                  : "bg-white/10 text-white border-white/10 hover:bg-white/15",
              ].join(" ")}
            >
              {sharing ? "Stop share" : "Share screen"}
            </button>
          </div>

          <div className="text-xs text-zinc-400">
            {inCall} in call • Best for small groups (mesh)
          </div>
        </div>
      </div>
    </div>
  );
}
