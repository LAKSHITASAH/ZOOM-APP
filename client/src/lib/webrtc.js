export const RTC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // IMPORTANT
};

export function stopStream(stream) {
  if (!stream) return;
  for (const t of stream.getTracks()) t.stop();
}

export async function replaceVideoTrack(pc, newTrack) {
  const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
  if (sender) await sender.replaceTrack(newTrack);
}
