import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { offlineDemoLogin, offlineLogin, offlineRegister } from "../lib/auth";

/**
 * Zoom-like auth popup for Landing page.
 * - Does NOT replace your /login or /register pages.
 * - Uses your existing offline auth helpers.
 * - On success, calls onSuccess() (Landing navigates to /welcome).
 */
export default function LandingAuthModal({ open, tab, onClose, onTabChange, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = tab === "login";

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (isLogin) return (email.trim().length > 0 || password.length > 0) && !loading;
    return name.trim().length >= 2 && email.trim().includes("@") && password.length >= 4 && !loading;
  }, [isLogin, name, email, password, loading]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (isLogin) {
        offlineLogin({ email: email || "user@demo.com", password: password || "demo" });
        onSuccess?.(); // ✅ login -> welcome
        return;
      }

      offlineRegister({ name: name || "User", email, password });
      onSuccess?.(); // ✅ signup -> welcome
    } catch (e2) {
      setErr(e2?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function demoLogin() {
    setErr("");
    try {
      offlineDemoLogin();
      onSuccess?.();
    } catch (e2) {
      setErr(e2?.message || "Demo login failed");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-[28px] bg-white text-[#07103A] shadow-[0_40px_140px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="font-extrabold text-xl">Zoom</div>
            <div className="text-sm text-black/50">•</div>
            <div className="text-sm font-semibold text-black/60">
              {isLogin ? "Sign in" : "Create account"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center hover:bg-black/[0.04]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="grid lg:grid-cols-[320px_1fr]">
          {/* left: tabs/info */}
          <div className="border-r border-black/10 p-6 bg-[#F6F8FF]">
            <div className="text-sm font-semibold text-[#07103A]/70">Account</div>

            <div className="mt-4 rounded-2xl bg-white border border-black/10 p-2">
              <button
                type="button"
                onClick={() => onTabChange?.("login")}
                className={[
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition",
                  tab === "login" ? "bg-blue-600 text-white" : "hover:bg-black/[0.04] text-[#07103A]",
                ].join(" ")}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onTabChange?.("register")}
                className={[
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition",
                  tab === "register" ? "bg-blue-600 text-white" : "hover:bg-black/[0.04] text-[#07103A]",
                ].join(" ")}
              >
                Sign up free
              </button>
            </div>

            <div className="mt-6 text-xs text-[#07103A]/55 leading-relaxed">
              This is a demo Zoom-style modal using your existing offline auth helpers.
              After sign in / sign up, you go to <span className="font-semibold">/welcome</span>.
            </div>

            <Button
              type="button"
              className="mt-6 w-full rounded-xl bg-white text-[#07103A] border border-black/15 hover:bg-black/[0.03]"
              onClick={demoLogin}
            >
              Try demo login
            </Button>
          </div>

          {/* right: form */}
          <div className="p-6 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isLogin ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-black/60 font-medium">
              {isLogin ? "Join or host meetings in seconds." : "Start hosting meetings in minutes."}
            </p>

            {err && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">
                {err}
              </div>
            )}

            <form onSubmit={submit} className="mt-7 space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-semibold text-black/70">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-black/70">
                  {isLogin ? "Email or phone number" : "Email"}
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40"
                  placeholder={isLogin ? "Enter email or phone" : "you@example.com"}
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">
                  Password {isLogin ? "" : "(min 4 chars)"}
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 w-full h-12 rounded-2xl border border-black/15 px-4 outline-none focus:ring-4 focus:ring-blue-600/15 focus:border-blue-600/40"
                  placeholder={isLogin ? "Enter password" : "Create a password"}
                />
              </div>

              <button
                disabled={!canSubmit}
                className="w-full h-12 rounded-2xl bg-[#0B5CFF] hover:bg-[#0A4FE0] text-white font-extrabold disabled:opacity-60 disabled:hover:bg-[#0B5CFF] transition"
              >
                {loading ? (isLogin ? "Signing in..." : "Creating...") : isLogin ? "Next" : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-sm text-black/60 font-semibold">
              {isLogin ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    className="text-[#0B5CFF] hover:underline"
                    onClick={() => onTabChange?.("register")}
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    type="button"
                    className="text-[#0B5CFF] hover:underline"
                    onClick={() => onTabChange?.("login")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <p className="mt-4 text-xs text-black/50">
              Zoom is protected by reCAPTCHA and the Privacy Policy and Terms of Service apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
