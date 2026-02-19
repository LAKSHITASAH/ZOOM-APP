// client/src/lib/api.js

const BASE = (import.meta.env.VITE_API_URL || "https://zoom-app-jzip.onrender.com").replace(/\/$/, "");

export async function api(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
  });

  // helpful error
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  // handle 204 No Content safely
  if (res.status === 204) return null;

  return res.json();
}
