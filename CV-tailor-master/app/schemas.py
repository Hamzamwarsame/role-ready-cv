from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional


# ── Auth schemas ───────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Full CV structure ──────────────────────────────────────────────────────────

class CVHeader(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""


class SkillCategory(BaseModel):
    category: str
    items: list[str]


class ExperienceBullet(BaseModel):
    text: str
    source_snippet: str = ""
    keywords_added: list[str] = Field(default_factory=list)
    change_type: str = "reworded"  # reworded | reordered | quantified | unchanged


class ExperienceItem(BaseModel):
    company: str
    title: str
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[ExperienceBullet] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    url: str = ""
    bullets: list[ExperienceBullet] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    grade: str = ""


class CertificationItem(BaseModel):
    name: str
    issuer: str = ""
    date: str = ""
    url: str = ""


class AwardItem(BaseModel):
    name: str
    issuer: str = ""
    date: str = ""
    description: str = ""


class TailoredCV(BaseModel):
    header: CVHeader = Field(default_factory=CVHeader)
    summary: str = ""
    skills: list[SkillCategory] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    awards: list[AwardItem] = Field(default_factory=list)
    leadership_and_activities: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    match_score: int = Field(default=0, ge=0, le=100)


# ── API request / response schemas ────────────────────────────────────────────

class TailorRequest(BaseModel):
    cv_text: str = Field(min_length=50)
    job_description: str = Field(min_length=50)


class TailorResponse(BaseModel):
    # New full CV structure (present in new runs)
    tailored_cv: Optional[TailoredCV] = None
    analysis: Optional[AnalysisResult] = None
    # Legacy flat fields — kept so old DB rows still deserialise cleanly
    tailored_summary: str = ""
    tailored_bullets: list[str] = Field(default_factory=list)
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    match_score: int = Field(default=0, ge=0, le=100)
    keywords: list[str] = Field(default_factory=list)


# ── Stored CV endpoints ────────────────────────────────────────────────────────

class CVCreate(BaseModel):
    title: Optional[str] = None
    cv_text: str = Field(min_length=50)


class CVUpdate(BaseModel):
    title: Optional[str] = None
    cv_text: Optional[str] = Field(default=None, min_length=50)


class CVOut(BaseModel):
    id: int
    title: Optional[str]
    cv_text: str
    created_at: datetime
    updated_at: datetime


class CVListOut(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime


class TailorFromCVRequest(BaseModel):
    job_description: str = Field(min_length=50)


class TailorRunOut(BaseModel):
    id: int
    created_at: datetime
    cv_id: Optional[int]
    job_description: str
    output: TailorResponse
