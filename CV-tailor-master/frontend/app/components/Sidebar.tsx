"use client";

import { useRouter } from "next/navigation";
import { FileText, Plus, LogOut } from "lucide-react";
import { getUser, clearAuth } from "../lib/auth";
import type { CVListItem, TailorRun } from "../lib/types";
import RunHistoryList from "./RunHistoryList";

interface SidebarProps {
  cvList: CVListItem[];
  selectedCvId: number | null;
  onSelectCv: (id: number) => void;
  onNewCv: () => void;
  runs: TailorRun[];
  activeRunId: number | null;
  onSelectRun: (run: TailorRun) => void;
}

export default function Sidebar({
  cvList, selectedCvId, onSelectCv, onNewCv, runs, activeRunId, onSelectRun,
}: SidebarProps) {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <aside className="flex flex-col w-52 shrink-0 bg-[#1A0F0A] text-white h-full overflow-hidden border-r border-white/5">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/8 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#F97316,#F43F5E)' }}>
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">CV Tailor</span>
        <span className="ml-auto text-[10px] text-[#FF9F4A] font-medium">AI</span>
      </div>

      {/* CV list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4">
        <section>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
              My CVs
            </span>
            <button
              onClick={onNewCv}
              title="New CV"
              className="rounded-md p-1 text-white/30 hover:bg-[#EA580C]/20 hover:text-[#FF9F4A] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {cvList.length === 0 && (
              <p className="text-xs text-white/25 px-2">No CVs yet.</p>
            )}
            {cvList.map((cv) => (
              <button
                key={cv.id}
                onClick={() => onSelectCv(cv.id)}
                className={`flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  selectedCvId === cv.id
                    ? "bg-[#EA580C]/25 text-white font-medium border border-[#EA580C]/30"
                    : "text-white/50 hover:bg-white/8 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{cv.title ?? `CV #${cv.id}`}</span>
              </button>
            ))}
          </div>
        </section>

        {selectedCvId !== null && (
          <section>
            <div className="px-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                History
              </span>
            </div>
            <RunHistoryList runs={runs} activeRunId={activeRunId} onSelect={onSelectRun} />
          </section>
        )}
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/8">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="h-7 w-7 rounded-full bg-[#EA580C]/30 border border-[#EA580C]/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#FF9F4A] uppercase">
              {user?.email?.[0] ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-white/70 truncate">{user?.email ?? "..."}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/25 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
