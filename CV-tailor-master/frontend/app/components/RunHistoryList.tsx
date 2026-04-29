"use client";

import RunCard from "./RunCard";
import type { TailorRun } from "../lib/types";

interface RunHistoryListProps {
  runs: TailorRun[];
  activeRunId: number | null;
  onSelect: (run: TailorRun) => void;
}

/**
 * Renders the list of previous tailoring runs for the selected CV.
 */
export default function RunHistoryList({
  runs,
  activeRunId,
  onSelect,
}: RunHistoryListProps) {
  if (runs.length === 0) {
    return (
      <p className="text-xs text-slate-400 px-3 py-2">No runs yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {runs.map((run) => (
        <RunCard
          key={run.id}
          run={run}
          isActive={run.id === activeRunId}
          onClick={() => onSelect(run)}
        />
      ))}
    </div>
  );
}
