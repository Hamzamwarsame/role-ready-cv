"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";
import { loginUser, registerUser } from "../lib/api";
import { setAuth, isAuthenticated } from "../lib/auth";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setConfirmEmail("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && email.trim() !== confirmEmail.trim()) {
      setError("Email addresses do not match.");
      return;
    }

    setLoading(true);
    try {
      const fn = mode === "login" ? loginUser : registerUser;
      const data = await fn(email.trim(), password);
      setAuth(data.access_token, data.user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const emailMismatch =
    mode === "register" && confirmEmail.length > 0 && email.trim() !== confirmEmail.trim();

  return (
    <div className="min-h-screen bg-[#120A06] flex flex-col items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#EA580C]/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#F43F5E]/10 blur-[120px]" />
      </div>

      <a href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#F43F5E] shadow-lg shadow-[#F97316]/30 group-hover:shadow-[#F97316]/50 transition-shadow">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">CV Tailor</span>
      </a>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

          <div className="flex rounded-xl bg-white/5 p-1 mb-7">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-[#EA580C] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login"
                ? "Sign in to your CV Tailor account"
                : "Create your account to start tailoring CVs"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/60 focus:border-[#EA580C]/60 transition"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Confirm email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="Repeat your email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={`w-full rounded-xl bg-white/5 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition ${
                      emailMismatch
                        ? "border-red-500/60 focus:ring-red-500/40"
                        : "border-white/10 focus:ring-[#EA580C]/60 focus:border-[#EA580C]/60"
                    }`}
                  />
                </div>
                {emailMismatch && (
                  <p className="mt-1.5 text-xs text-red-400">Email addresses do not match</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/60 focus:border-[#EA580C]/60 transition"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || emailMismatch}
              className="mt-1 w-full rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 disabled:cursor-not-allowed py-2.5 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-[#FF9F4A] hover:text-[#FFBE7A] font-medium transition-colors"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <a
              href="/admin/login"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Admin access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
