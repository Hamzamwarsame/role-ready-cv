"use client";

import {
  Download,
  CheckCircle,
  Bot,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import KeywordTag from "./KeywordTag";
import WarningCard from "./WarningCard";
import LoadingOverlay from "./LoadingOverlay";
import type {
  TailorResponse,
  TailoredCV,
  AnalysisResult,
} from "../lib/types";

interface ResultsPanelProps {
  result: TailorResponse | null;
  isLoading: boolean;
  onDownload: () => void;
}

// ── Match score ring ──────────────────────────────────────────────────────────

function MatchScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const gap = circumference - filled;
  const colour =
    score >= 75 ? "#EA580C" : score >= 50 ? "#D97706" : "#DC2626";
  const label =
    score >= 75 ? "Strong match" : score >= 50 ? "Partial match" : "Weak match";

  return (
    <div className="flex items-center gap-3">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle
          cx="34" cy="34" r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          strokeDashoffset={circumference / 4}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="34" y="38" textAnchor="middle" fontSize="13" fontWeight="700" fill={colour}>
          {score}
        </text>
      </svg>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400">Match score</p>
      </div>
    </div>
  );
}

// ── Full CV preview ───────────────────────────────────────────────────────────

function CVPreview({ cv }: { cv: TailoredCV }) {
  const {
    header,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    awards,
    leadership_and_activities,
    interests,
  } = cv;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      {header.name && (
        <div className="text-center pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{header.name}</h2>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-gray-500">
            {header.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-2.5 w-2.5" />{header.email}
              </span>
            )}
            {header.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-2.5 w-2.5" />{header.phone}
              </span>
            )}
            {header.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />{header.location}
              </span>
            )}
            {header.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="h-2.5 w-2.5" />{header.linkedin}
              </span>
            )}
            {header.github && (
              <span className="flex items-center gap-1">
                <Github className="h-2.5 w-2.5" />{header.github}
              </span>
            )}
            {header.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" />{header.website}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1.5">
            Professional Summary
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1.5">
            Skills
          </h3>
          <div className="flex flex-col gap-1">
            {skills.map((cat, i) => (
              <p key={i} className="text-sm">
                <span className="font-semibold text-gray-700">{cat.category}: </span>
                <span className="text-gray-600">{cat.items.join(", ")}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Projects — technical content leads */}
      {projects.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-2">
            Projects
          </h3>
          <div className="flex flex-col gap-4">
            {projects.map((proj, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-gray-900">{proj.name}</p>
                {proj.technologies.length > 0 && (
                  <p className="text-[10px] text-[#EA580C]/70 italic mb-0.5">
                    {proj.technologies.join(", ")}
                  </p>
                )}
                {proj.description && (
                  <p className="text-sm text-gray-600 mb-1">{proj.description}</p>
                )}
                {proj.bullets.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {proj.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C]" />
                        <span className="leading-snug">
                          {typeof bullet === "string" ? bullet : bullet.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-2">
            Experience
          </h3>
          <div className="flex flex-col gap-4">
            {experience.map((job, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{job.company}</p>
                    <p className="text-[11px] text-gray-500 italic">
                      {[job.title, job.location].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  {(job.start_date || job.end_date) && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                      {[job.start_date, job.end_date].filter(Boolean).join(" – ")}
                    </span>
                  )}
                </div>
                {job.bullets.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {job.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C]" />
                        <span className="leading-snug">
                          {typeof bullet === "string" ? bullet : bullet.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-2">
            Education
          </h3>
          <div className="flex flex-col gap-3">
            {education.map((edu, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{edu.institution}</p>
                  {(edu.start_date || edu.end_date) && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                      {[edu.start_date, edu.end_date].filter(Boolean).join(" – ")}
                    </span>
                  )}
                </div>
                {(edu.degree || edu.field) && (
                  <p className="text-[11px] text-gray-500 italic">
                    {[edu.degree, edu.field].filter(Boolean).join(" ")}
                    {edu.grade ? ` — ${edu.grade}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1.5">
            Certifications
          </h3>
          <div className="flex flex-col gap-1.5">
            {certifications.map((cert, i) => (
              <p key={i} className="text-sm text-gray-700">
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && <span className="text-gray-500"> · {cert.issuer}</span>}
                {cert.date && <span className="text-gray-400"> · {cert.date}</span>}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1.5">
            Awards
          </h3>
          <div className="flex flex-col gap-2">
            {awards.map((award, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-gray-700">
                  {award.name}
                  {award.issuer && <span className="text-gray-500 font-normal"> · {award.issuer}</span>}
                </p>
                {award.description && (
                  <p className="text-[11px] text-gray-500">{award.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leadership & Activities */}
      {leadership_and_activities.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1.5">
            Leadership & Activities
          </h3>
          <ul className="flex flex-col gap-1">
            {leadership_and_activities.map((item, i) => (
              <li key={i} className="text-sm text-gray-700">• {item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] mb-1">
            Interests
          </h3>
          <p className="text-sm text-gray-600">{interests.join(" · ")}</p>
        </section>
      )}
    </div>
  );
}

// ── Analysis section ──────────────────────────────────────────────────────────

function AnalysisSection({
  analysis,
  legacy,
}: {
  analysis?: AnalysisResult;
  legacy?: TailorResponse;
}) {
  const matched =
    analysis?.matched_keywords ??
    legacy?.matched_keywords ??
    legacy?.keywords ??
    [];
  const missing = analysis?.missing_keywords ?? legacy?.missing_keywords ?? [];
  const warnings = analysis?.warnings ?? legacy?.warnings ?? [];

  if (!matched.length && !missing.length && !warnings.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {matched.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Matched Keywords
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">
            Skills in both your CV and this role
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((kw, i) => (
              <KeywordTag key={i} keyword={kw} />
            ))}
          </div>
        </section>
      )}

      {missing.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1.5">
            Missing Keywords
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">
            Required by the role but not found in your CV
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
              >
                <XCircle className="h-3 w-3" />
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      {warnings.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">
            Skills Gap Warnings
          </h3>
          <div className="flex flex-col gap-2">
            {warnings.map((w, i) => (
              <WarningCard key={i} warning={w} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Legacy layout for old runs ────────────────────────────────────────────────

function LegacyResults({ result }: { result: TailorResponse }) {
  return (
    <div className="flex flex-col gap-5">
      {result.tailored_summary && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Professional Summary
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            {result.tailored_summary}
          </p>
        </section>
      )}
      {(result.tailored_bullets ?? []).length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Tailored Experience
          </h3>
          <ul className="flex flex-col gap-2">
            {(result.tailored_bullets ?? []).map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" />
                <span className="leading-snug">{bullet}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Separator className="bg-gray-100" />
      <AnalysisSection legacy={result} />
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function ResultsPanel({
  result,
  isLoading,
  onDownload,
}: ResultsPanelProps) {
  if (isLoading) return <LoadingOverlay />;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <div className="rounded-full bg-[#FFF8F1] p-4">
          <Bot className="h-8 w-8 text-[#EA580C]" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">AI results will appear here</p>
          <p className="text-xs text-gray-400 mt-1">
            Select a CV, paste a job description, and click Tailor Now
          </p>
        </div>
      </div>
    );
  }

  const isNewFormat = !!result.tailored_cv;
  const score = isNewFormat
    ? (result.analysis?.match_score ?? 0)
    : (result.match_score ?? 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            AI Results
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#C2410C] bg-[#FFF8F1] border border-[#FFDAB3] rounded-full px-2 py-0.5">
            <Bot className="h-3 w-3" />
            AI-generated · Not fabricated
          </span>
        </div>
        <Button
          onClick={onDownload}
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs border-gray-200 hover:border-[#FFDAB3] hover:text-[#C2410C]"
        >
          <Download className="h-3.5 w-3.5" />
          Download DOCX
        </Button>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="flex flex-col gap-5">
          <MatchScoreRing score={score} />
          <Separator className="bg-gray-100" />

          {isNewFormat && result.tailored_cv ? (
            <>
              <CVPreview cv={result.tailored_cv} />
              <Separator className="bg-gray-100" />
              <AnalysisSection analysis={result.analysis} />
            </>
          ) : (
            <LegacyResults result={result} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
