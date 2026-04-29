const KEY = "cv_tailor_admin_token";

export function setAdminToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}
