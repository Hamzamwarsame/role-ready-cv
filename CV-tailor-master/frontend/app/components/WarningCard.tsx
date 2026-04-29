"use client";

import { AlertTriangle } from "lucide-react";

interface WarningCardProps { warning: string }

export default function WarningCard({ warning }: WarningCardProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-[#FEFCE8] border border-[#FEF08A] px-3 py-2.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#CA8A04]" />
      <p className="text-sm text-[#854D0E] leading-snug">{warning}</p>
    </div>
  );
}
