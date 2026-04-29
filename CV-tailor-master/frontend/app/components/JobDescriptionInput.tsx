"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionInputProps {
  onTailor: (jobDescription: string) => Promise<void>;
  isLoading: boolean;
}

export default function JobDescriptionInput({ onTailor, isLoading }: JobDescriptionInputProps) {
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = async () => {
    if (jobDescription.trim().length < 50 || isLoading) return;
    await onTailor(jobDescription.trim());
    setJobDescription("");
  };

  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Job Description
      </label>
      <Textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here… (minimum 50 characters)"
        rows={5}
        className="resize-none text-sm border-gray-200 focus-visible:ring-[#EA580C] rounded-xl"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {jobDescription.length < 50
            ? `${50 - jobDescription.length} more chars needed`
            : "Ready to tailor"}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={jobDescription.trim().length < 50 || isLoading}
          size="sm"
          className="text-white gap-1.5 border-0"
          style={{ background: isLoading ? '#C2410C' : 'linear-gradient(135deg,#FFBE7A 0%,#F97316 55%,#F43F5E 100%)' }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isLoading ? "Tailoring…" : "Tailor Now"}
        </Button>
      </div>
    </div>
  );
}
