"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, FileText, Zap, TrendingUp, Trash2, LogOut, ShieldCheck,
  RefreshCw, AlertTriangle, ChevronUp, ChevronDown,
} from "lucide-react";
import { getAdminToken, clearAdminToken, isAdminAuthenticated } from "../lib/adminAuth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string>),
    },
  });
  if (res.status === 401 || res.status === 403) {
    clearAdminToken();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Analytics {
  total_users: number;
  total_cvs: number;
  total_runs: number;
  runs_this_week: number;
  new_users_this_week: number;
  recent_runs: { run_id: number; user_email: string; created_at: string; match_score: number }[];
}

interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  cv_count: number;
  run_count: number;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ?? "bg-[#EA580C]/20"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-white" : "text-[#FF9F4A]"}`} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SortKey = "email" | "created_at" | "cv_count" | "run_count";

export default function AdminDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.replace("/admin/login"); return; }
    load();
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, u] = await Promise.all([
        adminFetch<Analytics>("/admin/analytics"),
        adminFetch<AdminUser[]>("/admin/users"),
      ]);
      setAnalytics(a);
      setUsers(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  async function deleteUser(user: AdminUser) {
    setDeletingId(user.id);
    setConfirmDelete(null);
    try {
      await adminFetch(`/admin/users/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (analytics) {
        setAnalytics({
          ...analytics,
          total_users: analytics.total_users - 1,
          total_cvs: analytics.total_cvs - user.cv_count,
          total_runs: analytics.total_runs - user.run_count,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = users
    .filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-[#FF9F4A]" />
      : <ChevronDown className="w-3 h-3 text-[#FF9F4A]" />;
  }

  return (
    <div className="min-h-screen bg-[#120A06] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 h-[600px] w-[600px] rounded-full bg-[#EA580C]/6 blur-[140px]" />
        <div className="absolute -bottom-60 -right-60 h-[500px] w-[500px] rounded-full bg-[#F43F5E]/6 blur-[140px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6 backdrop-blur-xl bg-[#120A06]/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F97316] to-[#F43F5E] flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CV Tailor Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => { clearAdminToken(); router.replace("/admin/login"); }}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Overview of all users and activity</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={analytics.total_users} sub={`+${analytics.new_users_this_week} this week`} />
            <StatCard icon={FileText} label="Total CVs" value={analytics.total_cvs} />
            <StatCard icon={Zap} label="Total Runs" value={analytics.total_runs} />
            <StatCard icon={TrendingUp} label="Runs This Week" value={analytics.runs_this_week} accent="bg-[#EA580C]/30" />
            <StatCard icon={Users} label="New Users" value={analytics.new_users_this_week} sub="last 7 days" />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Users table */}
          <div className="xl:col-span-2 rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">All Users</h2>
              <input
                type="text"
                placeholder="Search by email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#EA580C]/50 transition"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-5 h-5 text-[#EA580C] animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/6">
                      {([
                        ["email", "Email"],
                        ["created_at", "Joined"],
                        ["cv_count", "CVs"],
                        ["run_count", "Runs"],
                      ] as [SortKey, string][]).map(([key, label]) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30 cursor-pointer hover:text-white/60 transition-colors select-none"
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            <SortIcon col={key} />
                          </span>
                        </th>
                      ))}
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-white/30 text-xs">
                          No users found
                        </td>
                      </tr>
                    )}
                    {filtered.map((user) => (
                      <tr key={user.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/20 flex items-center justify-center text-[10px] font-semibold text-[#FF9F4A]">
                              {user.email[0].toUpperCase()}
                            </div>
                            <span className="text-white/80 text-xs">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-white/40">
                          {new Date(user.created_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 text-xs text-white/60 font-medium">
                            {user.cv_count}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EA580C]/10 text-xs text-[#FF9F4A] font-medium">
                            {user.run_count}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setConfirmDelete(user)}
                            disabled={deletingId === user.id}
                            className="inline-flex items-center gap-1 text-xs text-white/25 hover:text-red-400 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deletingId === user.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent runs */}
          <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6">
              <h2 className="text-sm font-semibold">Recent Tailoring Runs</h2>
            </div>
            <div className="divide-y divide-white/4">
              {(analytics?.recent_runs ?? []).length === 0 && !loading && (
                <p className="px-5 py-8 text-xs text-white/30 text-center">No runs yet</p>
              )}
              {(analytics?.recent_runs ?? []).map((run) => (
                <div key={run.run_id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-white/70 truncate">{run.user_email}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {new Date(run.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })}{" "}
                      · Run #{run.run_id}
                    </p>
                  </div>
                  <div
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: run.match_score >= 75
                        ? "rgba(234,88,12,0.2)"
                        : run.match_score >= 50
                        ? "rgba(217,119,6,0.2)"
                        : "rgba(220,38,38,0.2)",
                      color: run.match_score >= 75 ? "#FF9F4A"
                        : run.match_score >= 50 ? "#FCD34D"
                        : "#F87171",
                    }}
                  >
                    {run.match_score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1A0F0A] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete user?</h3>
                <p className="text-xs text-white/40">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-1">
              You are about to permanently delete:
            </p>
            <p className="text-sm font-medium text-white mb-1">{confirmDelete.email}</p>
            <p className="text-xs text-white/40 mb-6">
              This will also delete {confirmDelete.cv_count} CV{confirmDelete.cv_count !== 1 ? "s" : ""} and{" "}
              {confirmDelete.run_count} tailoring run{confirmDelete.run_count !== 1 ? "s" : ""}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
