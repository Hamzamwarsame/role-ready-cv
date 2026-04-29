"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAuthenticated } from "../lib/auth";
import Sidebar from "../components/Sidebar";
import CVEditor from "../components/CVEditor";
import JobDescriptionInput from "../components/JobDescriptionInput";
import ResultsPanel from "../components/ResultsPanel";
import { listCVs, createCV, getCV, updateCV, tailorCV, listRuns, downloadDocx } from "../lib/api";
import type { CV, CVListItem, TailorResponse, TailorRun } from "../lib/types";

/**
 * Main application page.
 * Manages all application state and orchestrates communication between panels.
 */
export default function Home() {
  const router = useRouter();


  // ── CV state ─────────────────────────────────────────────────────────────
  const [cvList, setCvList] = useState<CVListItem[]>([]);
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // ── Run / tailoring state ─────────────────────────────────────────────────
  const [runs, setRuns] = useState<TailorRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);
  const [activeJobDescription, setActiveJobDescription] = useState<string>("");
  const [isTailoring, setIsTailoring] = useState(false);

  // ── Error state ───────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  // Load CV list on mount
  useEffect(() => {
    listCVs()
      .then(setCvList)
      .catch(() => setError("Failed to load CVs. Is the backend running?"));
  }, []);

  // When a CV is selected, load its full data and run history
  const handleSelectCv = useCallback(async (id: number) => {
    setIsCreatingNew(false);
    setTailorResult(null);
    setActiveRunId(null);
    setRuns([]);
    try {
      const [cv, cvRuns] = await Promise.all([getCV(id), listRuns(id)]);
      setSelectedCv(cv);
      setRuns(cvRuns);
    } catch {
      setError("Failed to load CV.");
    }
  }, []);

  // Save a new CV
  const handleCreateCv = useCallback(
    async (title: string, text: string) => {
      try {
        const newCv = await createCV(title, text);
        const listItem: CVListItem = {
          id: newCv.id,
          title: newCv.title,
          created_at: newCv.created_at,
        };
        setCvList((prev) => [listItem, ...prev]);
        setSelectedCv(newCv);
        setIsCreatingNew(false);
        setRuns([]);
      } catch {
        setError("Failed to create CV.");
      }
    },
    []
  );

  // Update an existing CV
  const handleUpdateCv = useCallback(
    async (title: string, text: string) => {
      if (!selectedCv) return;
      try {
        const updated = await updateCV(selectedCv.id, {
          title,
          cv_text: text,
        });
        setSelectedCv(updated);
        setCvList((prev) =>
          prev.map((c) =>
            c.id === updated.id
              ? { ...c, title: updated.title }
              : c
          )
        );
      } catch {
        setError("Failed to update CV.");
      }
    },
    [selectedCv]
  );

  // Run AI tailoring
  const handleTailor = useCallback(
    async (jobDescription: string) => {
      if (!selectedCv) return;
      setIsTailoring(true);
      setTailorResult(null);
      setActiveRunId(null);
      setError(null);
      try {
        const result = await tailorCV(selectedCv.id, jobDescription);
        setTailorResult(result);
        setActiveJobDescription(jobDescription);
        // Refresh run history
        const updatedRuns = await listRuns(selectedCv.id);
        setRuns(updatedRuns);
        if (updatedRuns.length > 0) setActiveRunId(updatedRuns[0].id);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Tailoring failed.");
      } finally {
        setIsTailoring(false);
      }
    },
    [selectedCv]
  );

  // Load a historical run into the results panel
  const handleSelectRun = useCallback((run: TailorRun) => {
    setActiveRunId(run.id);
    setTailorResult(run.output);
    setActiveJobDescription(run.job_description);
  }, []);

  // Download DOCX for the active run
  const handleDownload = useCallback(async () => {
    if (activeRunId !== null) {
      try {
        await downloadDocx(activeRunId);
      } catch {
        setError("Download failed. Please try again.");
      }
    }
  }, [activeRunId]);

  return (
    <div className="flex h-full">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        cvList={cvList}
        selectedCvId={selectedCv?.id ?? null}
        onSelectCv={handleSelectCv}
        onNewCv={() => {
          setIsCreatingNew(true);
          setSelectedCv(null);
          setRuns([]);
          setTailorResult(null);
        }}
        runs={runs}
        activeRunId={activeRunId}
        onSelectRun={handleSelectRun}
      />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: CV editor ──────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-gray-100 bg-white overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#EA580C] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Home
            </Link>
            <span className="text-gray-200">|</span>
            <h2 className="text-sm font-semibold text-gray-800">
              {isCreatingNew
                ? "New CV"
                : selectedCv
                ? selectedCv.title ?? `CV #${selectedCv.id}`
                : "Select or create a CV"}
            </h2>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
            {isCreatingNew ? (
              <CVEditor
                cvText={null}
                title={null}
                onSave={handleCreateCv}
                onCancel={() => setIsCreatingNew(false)}
                isNew
              />
            ) : selectedCv ? (
              <>
                <div className="flex-1 overflow-hidden">
                  <CVEditor
                    cvText={selectedCv.cv_text}
                    title={selectedCv.title}
                    onSave={handleUpdateCv}
                  />
                </div>
                <JobDescriptionInput
                  onTailor={handleTailor}
                  isLoading={isTailoring}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <p className="text-sm text-gray-500">
                  Select a CV from the sidebar or click{" "}
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="text-[#EA580C] font-medium hover:underline"
                  >
                    + New CV
                  </button>{" "}
                  to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: AI results ─────────────────────────────────────── */}
        <div className="w-[440px] shrink-0 bg-[#FAFAFA] flex flex-col overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#F97316] to-[#F43F5E]" />
            <h2 className="text-sm font-semibold text-gray-800">
              AI Tailoring Results
            </h2>
          </div>
          <div className="flex-1 overflow-hidden px-6 py-4">
            <ResultsPanel
              result={tailorResult}
              isLoading={isTailoring}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>

      {/* ── Global error toast ────────────────────────────────────────────── */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm">
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
