"use client";

interface KeywordTagProps { keyword: string }

export default function KeywordTag({ keyword }: KeywordTagProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEEDD] text-[#C2410C] border border-[#FFDAB3]">
      {keyword}
    </span>
  );
}
