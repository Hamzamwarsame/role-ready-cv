"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Plus, FileText, Zap, TrendingUp, LogOut,
  ArrowRight, Clock, ChevronRight, Target, Loader2,
} from "lucide-react";
import { isAuthenticated, getUser, clearAuth } from "../lib/auth";
import { listCVs, listRuns } from "../lib/api";
import type { CVListItem, TailorRun } from "../lib/types";

export default function Dashboard() {
  const router = useRouter();
  const user = getUser();

  const [cvs, setCvs] = useState<CVListItem[]>([]);
  const [recentRuns, setRecentRuns] = useState<TailorRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    load();
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cvList = await listCVs();
      setCvs(cvList);
      const runArrays = await Promise.all(cvList.slice(0, 5).map((cv) => listRuns(cv.id)));
      const all = runArrays.flat().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentRuns(all.slice(0, 8));
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, []);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  const totalRuns = recentRuns.length;
  const avgScore = recentRuns.length
    ? Math.round(
        recentRuns.reduce((sum, r) => {
          const s = r.output?.analysis?.match_score ?? r.output?.match_score ?? 0;
          return sum + s;
        }, 0) / recentRuns.length
      )
    : 0;
  const bestScore = recentRuns.length
    ? Math.max(...recentRuns.map((r) => r.output?.analysis?.match_score ?? r.output?.match_score ?? 0))
    : 0;

  const initials = user?.email?.[0]?.toUpperCase() ?? "U";
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-[#120A06] text-white">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-40 h-[500px] w-[500px] rounded-full bg-[#EA580C]/8 blur-[130px]" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-[#F43F5E]/6 blur-[130px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#120A06]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F97316] to-[#F43F5E] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CV Tailor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/tailor"
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#EA580C] hover:bg-[#C2410C] transition-colors rounded-lg px-4 py-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Tailor Now
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/20 flex items-center justify-center text-xs font-semibold text-[#FF9F4A]">
                {initials}
              </div>
              <button
                onClick={logout}
                className="text-white/30 hover:text-white/60 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16 relative">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-white/40 mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold">{user?.email?.split("@")[0] ?? "Welcome back"}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-[#EA580C] animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">CVs Saved</span>
                  <FileText className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-3xl font-bold">{cvs.length}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Tailoring Runs</span>
                  <Zap className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-3xl font-bold">{totalRuns}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Avg Score</span>
                  <TrendingUp className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-3xl font-bold" style={{ color: avgScore >= 75 ? "#FF9F4A" : avgScore >= 50 ? "#FCD34D" : "#F87171" }}>
                  {totalRuns ? `${avgScore}` : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Best Score</span>
                  <Target className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-3xl font-bold" style={{ color: bestScore >= 75 ? "#FF9F4A" : bestScore >= 50 ? "#FCD34D" : "#F87171" }}>
                  {totalRuns ? `${bestScore}` : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* CVs panel */}
              <div className="lg:col-span-1 rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Your CVs</h2>
                  <Link
                    href="/tailor"
                    className="flex items-center gap-1 text-xs text-[#FF9F4A] hover:text-[#FFBE7A] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    New
                  </Link>
                </div>

                {cvs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#EA580C]/10 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5 text-[#EA580C]/60" />
                    </div>
                    <p className="text-sm text-white/40 mb-4">No CVs yet</p>
                    <Link
                      href="/tailor"
                      className="text-xs font-medium text-[#FF9F4A] hover:text-[#FFBE7A] transition-colors"
                    >
                      Upload your first CV →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/4">
                    {cvs.map((cv) => (
                      <Link
                        key={cv.id}
                        href="/tailor"
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#EA580C]/10 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-[#EA580C]/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white/80 truncate">
                              {cv.title ?? `CV #${cv.id}`}
                            </p>
                            <p className="text-[10px] text-white/30">
                              {new Date(cv.created_at).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent runs panel */}
              <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Recent Tailoring Runs</h2>
                  <Link
                    href="/tailor"
                    className="text-xs text-[#FF9F4A] hover:text-[#FFBE7A] transition-colors flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {recentRuns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#EA580C]/10 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-[#EA580C]/60" />
                    </div>
                    <p className="text-sm text-white/40 mb-1">No tailoring runs yet</p>
                    <p className="text-xs text-white/25 mb-4">Upload a CV and paste a job description to get started</p>
                    <Link
                      href="/tailor"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                      style={{ background: "linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)" }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Start Tailoring
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/4">
                    {recentRuns.map((run) => {
                      const score = run.output?.analysis?.match_score ?? run.output?.match_score ?? 0;
                      const scoreColor = score >= 75 ? "#FF9F4A" : score >= 50 ? "#FCD34D" : "#F87171";
                      const scoreBg = score >= 75 ? "rgba(234,88,12,0.15)" : score >= 50 ? "rgba(217,119,6,0.15)" : "rgba(220,38,38,0.15)";
                      const jd = run.job_description?.slice(0, 80) + (run.job_description?.length > 80 ? "…" : "");
                      const cvTitle = cvs.find((c) => c.id === run.cv_id)?.title ?? `CV #${run.cv_id}`;

                      return (
                        <Link
                          key={run.id}
                          href="/tailor"
                          className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
                        >
                          {/* Score ring */}
                          <div
                            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: scoreBg, color: scoreColor }}
                          >
                            {score}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/70 truncate">{jd}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/30">{cvTitle}</span>
                              <span className="text-[10px] text-white/15">·</span>
                              <span className="flex items-center gap-1 text-[10px] text-white/25">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(run.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short",
                                })}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/30 shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CTA banner */}
            <div className="mt-6 rounded-2xl border border-[#EA580C]/20 bg-gradient-to-r from-[#EA580C]/10 to-[#F43F5E]/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Ready to tailor your next application?</h3>
                <p className="text-xs text-white/40 mt-0.5">Paste a job description and get a tailored CV in seconds</p>
              </div>
              <Link
                href="/tailor"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-[#EA580C]/20 hover:shadow-[#EA580C]/40"
                style={{ background: "linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)" }}
              >
                <Zap className="w-4 h-4" />
                Tailor Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
