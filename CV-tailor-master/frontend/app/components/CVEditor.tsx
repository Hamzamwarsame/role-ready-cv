"use client";

import { useState, useRef, useCallback, Fragment } from "react";
import { Save, X, Bold, Italic, List, Minus, CaseSensitive, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CVEditorProps {
  cvText: string | null;
  title: string | null;
  onSave: (title: string, text: string) => Promise<void>;
  onCancel?: () => void;
  isNew?: boolean;
}

// ── Floating toolbar ──────────────────────────────────────────────────────────

interface ToolbarState { x: number; y: number }

const TOOLBAR_ACTIONS = [
  { id: "bold",   Icon: Bold,          title: "Bold  (**text**)" },
  { id: "italic", Icon: Italic,        title: "Italic  (_text_)" },
  { id: "bullet", Icon: List,          title: "Bullet list" },
  { id: "upper",  Icon: CaseSensitive, title: "UPPERCASE" },
  { id: "sep",    Icon: Minus,         title: "Separator line" },
] as const;

type ActionId = (typeof TOOLBAR_ACTIONS)[number]["id"];

function FloatingToolbar({ x, y, onAction }: { x: number; y: number; onAction: (id: ActionId) => void }) {
  const clamped = Math.max(4, Math.min(x - 112, window.innerWidth - 228));
  return (
    <div
      className="fixed z-50 flex items-center gap-px rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-sm p-1"
      style={{ top: y, left: clamped }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {TOOLBAR_ACTIONS.map((action, i) => (
        <Fragment key={action.id}>
          {i === 2 && <div className="w-px h-4 bg-white/10 mx-0.5" />}
          <button
            title={action.title}
            onClick={() => onAction(action.id)}
            className="h-7 w-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all"
          >
            <action.Icon className="h-3.5 w-3.5" />
          </button>
        </Fragment>
      ))}
    </div>
  );
}

// ── Formatting logic ──────────────────────────────────────────────────────────

function applyFormat(text: string, selStart: number, selEnd: number, action: ActionId) {
  const before = text.slice(0, selStart);
  const selected = text.slice(selStart, selEnd);
  const after = text.slice(selEnd);

  switch (action) {
    case "bold":   return { newText: before + `**${selected}**` + after, newStart: selStart + 2, newEnd: selEnd + 2 };
    case "italic": return { newText: before + `_${selected}_` + after, newStart: selStart + 1, newEnd: selEnd + 1 };
    case "bullet": {
      const prefixed = selected.split("\n").map((l) => (l.trim() ? `• ${l}` : l)).join("\n");
      return { newText: before + prefixed + after, newStart: selStart, newEnd: selStart + prefixed.length };
    }
    case "upper": {
      const upper = selected.toUpperCase();
      return { newText: before + upper + after, newStart: selStart, newEnd: selStart + upper.length };
    }
    case "sep": {
      const rule = "\n──────────────────────\n";
      return { newText: before + selected + rule + after, newStart: selEnd + rule.length, newEnd: selEnd + rule.length };
    }
  }
}

// ── File extraction ───────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string ?? "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  if (ext === "docx") {
    const mammoth = (await import("mammoth")).default;
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    return pages.join("\n\n");
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
}

// ── Editor ────────────────────────────────────────────────────────────────────

export default function CVEditor({ cvText, title, onSave, onCancel, isNew = false }: CVEditorProps) {
  const [editTitle, setEditTitle] = useState(title ?? "");
  const [editText, setEditText]   = useState(cvText ?? "");
  const [saving, setSaving]       = useState(false);
  const [toolbar, setToolbar]     = useState<ToolbarState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(!!cvText);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (editText.trim().length < 50) return;
    setSaving(true);
    try {
      await onSave(editTitle.trim() || "Untitled CV", editText.trim());
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const text = await extractText(file);
      if (!text.trim()) throw new Error("Could not extract text from this file. Try a different format.");
      setEditText(text);
      setUploadedFileName(file.name);
      if (!editTitle) setEditTitle(file.name.replace(/\.[^.]+$/, ""));
      setShowTextEditor(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to read file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file], value: "" }, preventDefault: () => {} } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleFileChange(fakeEvent);
  }, [editTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToolbarIfSelection = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;
      if (ta.selectionStart === ta.selectionEnd) { setToolbar(null); return; }
      const rect = ta.getBoundingClientRect();
      const mouseY = "clientY" in e ? e.clientY : rect.top + 60;
      setToolbar({ x: rect.left + rect.width / 2, y: mouseY - 52 });
    },
    [],
  );

  const handleAction = useCallback(
    (action: ActionId) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: e } = ta;
      const { newText, newStart, newEnd } = applyFormat(editText, s, e, action);
      setEditText(newText);
      setToolbar(null);
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(newStart, newEnd); });
    },
    [editText],
  );

  return (
    <div className="flex flex-col h-full gap-3">

      {/* Title row */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="CV title (optional)"
          className="flex-1 text-sm font-medium bg-transparent border-b border-gray-200 focus:border-[#EA580C] focus:outline-none pb-1 transition-colors placeholder:text-gray-300"
        />
        {isNew && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload zone — shown when no text yet, or as a toggle */}
      {!showTextEditor ? (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-200 hover:border-[#EA580C]/50 rounded-xl transition-colors cursor-pointer bg-gray-50/50"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-[#EA580C] animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1E8] flex items-center justify-center">
                <Upload className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Upload your CV</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT · drag & drop or click to browse</p>
              </div>
              {uploadError && (
                <p className="text-xs text-red-500 text-center px-4">{uploadError}</p>
              )}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <>
          {/* Uploaded file indicator + re-upload button */}
          <div className="flex items-center justify-between gap-2">
            {uploadedFileName && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <FileText className="h-3.5 w-3.5 text-[#EA580C]/60" />
                <span className="truncate max-w-[160px]">{uploadedFileName}</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-auto text-xs text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 shrink-0 transition-colors"
            >
              <Upload className="h-3 w-3" /> Re-upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {uploadError && (
            <p className="text-xs text-red-500">{uploadError}</p>
          )}

          {/* CV textarea */}
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onMouseUp={showToolbarIfSelection}
            onKeyUp={showToolbarIfSelection}
            onBlur={() => setToolbar(null)}
            placeholder="CV text will appear here after upload…"
            className="flex-1 resize-none font-mono text-sm leading-relaxed border border-gray-200 focus:border-[#EA580C]/60 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/10 rounded-xl p-3 transition-colors"
          />

          {toolbar && (
            <FloatingToolbar x={toolbar.x} y={toolbar.y} onAction={handleAction} />
          )}
        </>
      )}

      {/* Save button */}
      {showTextEditor && (isNew || editText !== cvText || editTitle !== (title ?? "")) && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || editText.trim().length < 50}
            size="sm"
            className="bg-[#EA580C] hover:bg-[#C2410C] text-white gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : isNew ? "Save CV" : "Update CV"}
          </Button>
        </div>
      )}
    </div>
  );
}
