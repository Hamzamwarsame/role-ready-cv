/**
 * API client — all calls to the FastAPI backend.
 * Automatically attaches the JWT token from localStorage.
 * Redirects to /login on 401.
 */

import { getToken, clearAuth } from "./auth";
import type { CV, CVListItem, TailorResponse, TailorRun } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export interface AuthPayload {
  access_token: string;
  token_type: string;
  user: { id: number; email: string; created_at: string };
}

export function registerUser(email: string, password: string): Promise<AuthPayload> {
  return request<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function loginUser(email: string, password: string): Promise<AuthPayload> {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── CVs ───────────────────────────────────────────────────────────────────────

export function listCVs(): Promise<CVListItem[]> {
  return request<CVListItem[]>("/cvs");
}

export function createCV(title: string | null, cv_text: string): Promise<CV> {
  return request<CV>("/cv", {
    method: "POST",
    body: JSON.stringify({ title, cv_text }),
  });
}

export function getCV(id: number): Promise<CV> {
  return request<CV>(`/cv/${id}`);
}

export function updateCV(id: number, data: { title?: string; cv_text?: string }): Promise<CV> {
  return request<CV>(`/cv/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Tailoring ─────────────────────────────────────────────────────────────────

export function tailorCV(cv_id: number, job_description: string): Promise<TailorResponse> {
  return request<TailorResponse>(`/cv/${cv_id}/tailor`, {
    method: "POST",
    body: JSON.stringify({ job_description }),
  });
}

// ── Runs ──────────────────────────────────────────────────────────────────────

export function listRuns(cv_id: number): Promise<TailorRun[]> {
  return request<TailorRun[]>(`/cv/${cv_id}/runs`);
}

export function getRun(run_id: number): Promise<TailorRun> {
  return request<TailorRun>(`/runs/${run_id}`);
}

export async function downloadDocx(run_id: number): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE}/runs/${run_id}/docx`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tailored_cv_run_${run_id}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
