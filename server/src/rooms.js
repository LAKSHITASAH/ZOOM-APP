// In-memory meeting store: code -> { code, createdAt }
export const meetings = new Map();

export function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

export function makeCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function ensureMeeting(code) {
  const c = normalizeCode(code);
  if (!meetings.has(c)) meetings.set(c, { code: c, createdAt: Date.now() });
  return meetings.get(c);
}
