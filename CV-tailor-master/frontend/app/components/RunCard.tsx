"use client";

import { Clock } from "lucide-react";
import type { TailorRun } from "../lib/types";

interface RunCardProps {
  run: TailorRun;
  isActive: boolean;
  onClick: () => void;
}

/**
 * A single tailoring run entry in the history list.
 */
export default function RunCard({ run, isActive, onClick }: RunCardProps) {
  const date = new Date(run.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Show the first 60 chars of the job description as a preview
  const preview =
    run.job_description.length > 60
      ? run.job_description.slice(0, 60) + "…"
      : run.job_description;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
        isActive
          ? "bg-white/20 text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="h-3 w-3 shrink-0" />
        <span className="text-xs font-medium">{date}</span>
      </div>
      <p className="text-xs leading-snug opacity-80">{preview}</p>
    </button>
  );
}
