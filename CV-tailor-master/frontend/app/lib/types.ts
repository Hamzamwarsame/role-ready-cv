// TypeScript types matching the FastAPI backend schemas

export interface CVListItem {
  id: number;
  title: string | null;
  created_at: string;
}

export interface CV {
  id: number;
  title: string | null;
  cv_text: string;
  created_at: string;
  updated_at: string;
}

// ── Full CV structure ──────────────────────────────────────────────────────────

export interface CVHeader {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ExperienceBullet {
  text: string;
  source_snippet: string;
  keywords_added: string[];
  change_type: "reworded" | "reordered" | "quantified" | "unchanged";
}

export interface ExperienceItem {
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  bullets: ExperienceBullet[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url: string;
  bullets: ExperienceBullet[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  grade: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface AwardItem {
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface TailoredCV {
  header: CVHeader;
  summary: string;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  leadership_and_activities: string[];
  interests: string[];
}

export interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  warnings: string[];
  match_score: number;
}

// ── API response types ─────────────────────────────────────────────────────────

export interface TailorResponse {
  // New full CV structure (present in new runs)
  tailored_cv?: TailoredCV;
  analysis?: AnalysisResult;
  // Legacy flat fields (present in old runs)
  tailored_summary?: string;
  tailored_bullets?: string[];
  matched_keywords?: string[];
  missing_keywords?: string[];
  warnings?: string[];
  match_score?: number;
  keywords?: string[];
}

export interface TailorRun {
  id: number;
  created_at: string;
  cv_id: number | null;
  job_description: string;
  output: TailorResponse;
}
