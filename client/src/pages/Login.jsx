import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { offlineDemoLogin, offlineLogin, setAuth } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (email.trim().length > 0 || password.length > 0) && !loading;
  }, [email, password, loading]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      offlineLogin({ email: email || "user@demo.com", password: password || "demo" });
      nav("/welcome"); // ← ONLY CHANGE
      return;

      // const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
      // setAuth(data.token, data.user);
      // nav("/welcome");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function demo() {
    setErr("");
    try {
      offlineDemoLogin();
      nav("/welcome"); // ← ONLY CHANGE
    } catch (e) {
      setErr(e.message || "Demo login failed");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b border-black/10 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 h-full flex items-center justify-between">
          <div className="text-4xl font-extrabold tracking-tight text-[#0B5CFF]">
            ZOOM
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold">
            <span className="text-black/60">New to Zoom?</span>
            <Link to="/register" className="text-[#0B5CFF] hover:underline">
              Sign Up Free
            </Link>
            <button
              type="button"
              onClick={() => alert("Support (demo)")}
              className="text-[#0B5CFF] hover:underline"
            >
              Support
            </button>
            <button
              type="button"
              className="text-black/70 hover:text-black flex items-center gap-1"
              onClick={() => alert("Language picker (demo)")}
            >
              English <span className="text-xs opacity-70">▼</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl bg-[#F3F7FF] p-10 flex justify-center">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.18)] border border-black/10">
              <div className="relative h-72">
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80"
                  alt="Zoom productivity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#07103A]/90 via-[#07103A]/70 to-[#0B5CFF]/25" />

                <div className="absolute inset-0 p-8 text-white flex flex-col justify-between">
                  <div className="font-semibold opacity-90">zoom</div>

                  <div>
                    <div className="text-3xl font-extrabold leading-tight">
                      PRODUCTIVITY <span className="text-cyan-300">SUMMIT</span> APAC
                    </div>
                    <div className="mt-2 text-sm opacity-90 font-semibold">
                      25 February 2026
                    </div>

                    <p className="mt-4 text-sm opacity-90 max-w-xs">
                      Zoom ahead with collaboration in the <span className="text-cyan-300 font-bold">AI</span> era
                    </p>

                    <button
                      type="button"
                      onClick={() => alert("Register (demo)")}
                      className="mt-6 inline-flex items-center justify-center h-11 px-6 rounded-full bg-cyan-300 text-[#07103A] font-extrabold hover:bg-cyan-200 transition"
                    >
                      REGISTER
                    </button>
                  </div>

                  <div className="text-xs opacity-70">
                    Open-source image from Unsplash
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <h1 className="text-5xl font-extrabold tracking-tight text-[#07103A]">
                Sign in
              </h1>

              <p className="mt-3 text-black/60 font-medium">
                Join or host meetings in seconds.
              </p>

              {err && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">
                  {err}
                </div>
              )}

              <form onSubmit={submit} className="mt-7 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Email or phone number
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40"
                    placeholder="Enter email or phone"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  disabled={!canSubmit}
                  className="w-full h-12 rounded-2xl bg-[#0B5CFF] hover:bg-[#0A4FE0] text-white font-extrabold disabled:opacity-60 disabled:hover:bg-[#0B5CFF] transition"
                >
                  {loading ? "Signing in..." : "Next"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px bg-black/10 flex-1" />
                <div className="text-sm text-black/50 font-semibold">Or sign in with</div>
                <div className="h-px bg-black/10 flex-1" />
              </div>

              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: "SSO", icon: "🔑" },
                  { label: "Apple", icon: "" },
                  { label: "Google", icon: "G" },
                  { label: "Facebook", icon: "f" },
                  { label: "Microsoft", icon: "⊞" },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => alert(`${b.label} login (demo)`)}
                    className="h-16 rounded-2xl border border-black/10 bg-white hover:bg-black/[0.03] shadow-sm flex flex-col items-center justify-center gap-1 font-extrabold text-[#07103A]"
                  >
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-[11px] opacity-70">{b.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={demo}
                type="button"
                className="mt-6 w-full h-12 rounded-2xl border border-black/15 bg-white hover:bg-black/[0.03] font-extrabold text-[#07103A]"
              >
                Try demo login
              </button>

              <div className="mt-7 flex items-center justify-center gap-6 text-sm font-semibold">
                <button type="button" onClick={() => alert("Help (demo)")} className="text-[#0B5CFF] hover:underline">
                  Help
                </button>
                <button type="button" onClick={() => alert("Terms (demo)")} className="text-[#0B5CFF] hover:underline">
                  Terms
                </button>
                <button type="button" onClick={() => alert("Privacy (demo)")} className="text-[#0B5CFF] hover:underline">
                  Privacy
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-black/55 font-medium">
                Zoom is protected by reCAPTCHA and the Privacy Policy and Terms of Service apply.
              </p>

              <p className="mt-5 text-center text-sm text-black/60 font-semibold">
                New here?{" "}
                <Link className="text-[#0B5CFF] hover:underline" to="/register">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
