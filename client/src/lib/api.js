const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

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
  return res.json();
}
