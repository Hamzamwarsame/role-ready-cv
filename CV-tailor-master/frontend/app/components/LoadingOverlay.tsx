"use client";

import { Loader2 } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#EA580C]" />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">Analysing your CV…</p>
        <p className="text-xs text-gray-400 mt-1">
          AI is tailoring your experience to the job description
        </p>
      </div>
    </div>
  );
}
