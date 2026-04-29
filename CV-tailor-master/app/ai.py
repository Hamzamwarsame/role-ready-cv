import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env")

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not found. Check .env in project root.")

client = OpenAI(api_key=api_key)

# ── Prompts ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a senior technical CV writer and ATS optimisation specialist with 15+ years of experience placing candidates in competitive technical roles. Your job is to strategically reconstruct a candidate's CV to maximise fit for a specific job description — without inventing a single fact.

═══════════════════════════════════════════════════════
CORE MANDATE — STRATEGIC RECONSTRUCTION
═══════════════════════════════════════════════════════
This is a full reconstruction, not a light rewrite. You must:
• Re-order every section so the strongest JD-aligned evidence appears first.
• Expand technical projects and experience that directly match the JD.
• Condense less relevant roles to a minimum of 2 bullets — NEVER omit a role, title, employer, or date.
• For technical roles (software engineer, data, ML, etc.), place `projects` BEFORE `experience`. For non-technical roles, keep experience first.
• Mirror the JD's exact terminology wherever the CV supports it (e.g. if the JD says "TypeScript" and the CV says "TS", rewrite as "TypeScript").
• Promote implicit evidence: if the CV mentions a tool/method the JD values, surface it explicitly in the summary, skills, or a bullet.

═══════════════════════════════════════════════════════
NON-FABRICATION — ABSOLUTE CONSTRAINT
═══════════════════════════════════════════════════════
Every fact in the output must be traceable to the source CV. Specifically:
• NEVER invent employers, job titles, dates, technologies, metrics, qualifications, certifications, or outcomes.
• NEVER inflate numbers ("improved performance" must not become "improved performance by 40%" unless 40% is in the CV).
• NEVER add a technology to `skills` or bullets unless it appears in the CV text.
• NEVER infer seniority the CV doesn't claim ("Led team of 5" is not valid if the CV only says "collaborated with team").
• Every bullet's `source_snippet` MUST be a verbatim phrase copied directly from the CV — no paraphrasing, no merging of multiple phrases.
• If a JD requirement has no CV evidence, it belongs in `missing_keywords` and `warnings` only — never in the CV body.
• Before finalising each bullet, silently verify: "Can I point to the exact words in the CV that support this?" If no, rewrite.

═══════════════════════════════════════════════════════
TONE & STYLE — SENIOR, HUMAN, NOT AI-WRITTEN
═══════════════════════════════════════════════════════
The voice must read as if written by a confident, experienced professional — direct, specific, and free of filler.

FORBIDDEN WORDS (automatic rewrite if any appear):
passionate, driven, dynamic, results-driven, team player, hardworking, motivated, leverage, spearheaded, synergy, proactive, detail-oriented, seasoned, go-getter, thought leader, guru, ninja, rockstar, utilise (use "use"), delve, tapestry, navigate (metaphorical), robust, seamless, cutting-edge, world-class, best-in-class, innovative (unless the CV claims innovation).

SUMMARY RULES:
• 2–3 sentences, 40–70 words total.
• Never open with "I am", "I have", "A [adjective] [role]", or "As a [role]".
• Open with a noun phrase or a strong factual statement (e.g. "Full-stack engineer with four years building...").
• Must reference: years of experience (if stated), primary domain/stack, one concrete strength relevant to the JD.

BULLET RULES:
• Structure: [Strong action verb] + [what you did] + [context/scale] + [outcome or tech used].
• Start with a strong action verb — never "I", "Responsible for", "Helped with", "Worked on", "Assisted in".
• Current role: present tense. Previous roles: past tense.
• Maximum 25 words. No full stop at the end.
• Lead with the strongest evidence — put quantified outcomes, scale, or impact near the front where they exist in the CV.
• Vary verbs across bullets — do not repeat the same verb twice in a row.
• Prefer specific nouns over vague ones ("Postgres" not "database"; "React" not "frontend framework") — but only if the CV specifies them.

═══════════════════════════════════════════════════════
BULLET DISTRIBUTION
═══════════════════════════════════════════════════════
• Projects: 6–8 bullets total across all projects combined.
• Experience: 2–4 bullets total across all roles combined — minimum 2 per role, never omit a role.
• Hard ceiling: 12 bullets across the entire CV.
• Weight distribution toward entries with the strongest JD alignment.

═══════════════════════════════════════════════════════
MATCH SCORE RUBRIC (0–100 integer, calibrated — NEVER inflated)
═══════════════════════════════════════════════════════
Weights: Skills 50% · Seniority 30% · Domain 20%.

• Skills (50 pts): % of JD-required hard skills evidenced in the CV.
• Seniority (30 pts): alignment of years of experience and scope. Exact = 30; one level off = 15; two+ levels off = 5.
• Domain (20 pts): same domain = 20; adjacent = 12; unrelated = 4.

Score bands: 85–100 strong fit · 70–84 good fit · 50–69 partial fit · 30–49 weak fit · 0–29 poor fit.
If the final score would be above 90, verify every JD requirement is actually evidenced.

═══════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════
Return a single JSON object matching the provided schema exactly. No prose, no markdown, no commentary outside the JSON."""

USER_PROMPT_TEMPLATE = """Tailor the CV below to the job description that follows. Output a single JSON object conforming to the schema.

═══════════════════════════════════════════════════════
SECTION ORDER (output in this exact order)
═══════════════════════════════════════════════════════
1. header
2. summary
3. skills
4. projects (place BEFORE experience for technical roles; otherwise swap 4 and 5)
5. experience
6. education
7. certifications
8. awards
9. leadership_and_activities
10. interests

═══════════════════════════════════════════════════════
PER-BULLET FIELDS (required for every bullet in projects and experience)
═══════════════════════════════════════════════════════
• `text`: the rewritten bullet, following all style rules.
• `source_snippet`: a verbatim phrase copied from the CV that justifies this bullet.
• `keywords_added`: list of JD keywords worked into this bullet (empty list if none).
• `change_type`: one of "reworded", "reordered", "quantified", "unchanged".

═══════════════════════════════════════════════════════
SKILLS SECTION
═══════════════════════════════════════════════════════
• Group skills into categories (e.g. "Languages", "Frameworks", "Tools", "Databases", "Cloud").
• Order categories by JD relevance — most relevant first.
• Within each category, order items by JD relevance.
• Only include skills that appear in the CV. Missing JD skills go to `missing_keywords` only.

═══════════════════════════════════════════════════════
ANALYSIS SECTION
═══════════════════════════════════════════════════════
• `matched_keywords`: JD keywords evidenced in the CV.
• `missing_keywords`: JD keywords/skills/requirements with no CV evidence.
• `warnings`: up to 5, format EXACTLY: "This role requires [X] — not evidenced in your CV."
• `match_score`: integer 0–100, using the rubric in the system prompt.

═══════════════════════════════════════════════════════
FINAL SELF-CHECK (perform silently before output)
═══════════════════════════════════════════════════════
1. Every `source_snippet` appears verbatim in the CV TEXT below.
2. No forbidden words appear in any `text` field.
3. No fabricated employers, dates, titles, tech, or metrics.
4. Summary does not start with "I am" or "I have".
5. Bullet count respects the 6–8 projects / 2–4 experience / 12 total limits.
6. No role has been omitted.
7. `matched_keywords` and `missing_keywords` are disjoint.
8. `match_score` reflects the rubric, not wishful thinking.

═══════════════════════════════════════════════════════
CV TEXT:
═══════════════════════════════════════════════════════
{cv_text}

═══════════════════════════════════════════════════════
JOB DESCRIPTION:
═══════════════════════════════════════════════════════
{job_description}"""

# ── JSON Schema ───────────────────────────────────────────────────────────────

_BULLET_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["text", "source_snippet", "keywords_added", "change_type"],
    "properties": {
        "text": {"type": "string", "maxLength": 250},
        "source_snippet": {"type": "string", "maxLength": 400},
        "keywords_added": {
            "type": "array",
            "items": {"type": "string", "maxLength": 80},
        },
        "change_type": {
            "type": "string",
            "enum": ["reworded", "reordered", "quantified", "unchanged"],
        },
    },
}

CV_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["tailored_cv", "analysis"],
    "properties": {
        "tailored_cv": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "header", "summary", "skills", "experience", "projects",
                "education", "certifications", "awards",
                "leadership_and_activities", "interests",
            ],
            "properties": {
                "header": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "name", "email", "phone", "location",
                        "linkedin", "github", "website",
                    ],
                    "properties": {
                        "name":     {"type": "string", "maxLength": 100},
                        "email":    {"type": "string", "maxLength": 200},
                        "phone":    {"type": "string", "maxLength": 50},
                        "location": {"type": "string", "maxLength": 150},
                        "linkedin": {"type": "string", "maxLength": 300},
                        "github":   {"type": "string", "maxLength": 300},
                        "website":  {"type": "string", "maxLength": 300},
                    },
                },
                "summary": {"type": "string", "maxLength": 600},
                "skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["category", "items"],
                        "properties": {
                            "category": {"type": "string", "maxLength": 80},
                            "items": {
                                "type": "array",
                                "items": {"type": "string", "maxLength": 60},
                            },
                        },
                    },
                },
                "experience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": [
                            "company", "title", "location",
                            "start_date", "end_date", "bullets",
                        ],
                        "properties": {
                            "company":    {"type": "string", "maxLength": 150},
                            "title":      {"type": "string", "maxLength": 150},
                            "location":   {"type": "string", "maxLength": 100},
                            "start_date": {"type": "string", "maxLength": 30},
                            "end_date":   {"type": "string", "maxLength": 30},
                            "bullets":    {"type": "array", "items": _BULLET_SCHEMA},
                        },
                    },
                },
                "projects": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": [
                            "name", "description", "technologies", "url", "bullets",
                        ],
                        "properties": {
                            "name":         {"type": "string", "maxLength": 150},
                            "description":  {"type": "string", "maxLength": 300},
                            "technologies": {
                                "type": "array",
                                "items": {"type": "string", "maxLength": 60},
                            },
                            "url":     {"type": "string", "maxLength": 300},
                            "bullets": {"type": "array", "items": _BULLET_SCHEMA},
                        },
                    },
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": [
                            "institution", "degree", "field",
                            "start_date", "end_date", "grade",
                        ],
                        "properties": {
                            "institution": {"type": "string", "maxLength": 200},
                            "degree":      {"type": "string", "maxLength": 100},
                            "field":       {"type": "string", "maxLength": 150},
                            "start_date":  {"type": "string", "maxLength": 30},
                            "end_date":    {"type": "string", "maxLength": 30},
                            "grade":       {"type": "string", "maxLength": 50},
                        },
                    },
                },
                "certifications": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["name", "issuer", "date", "url"],
                        "properties": {
                            "name":   {"type": "string", "maxLength": 200},
                            "issuer": {"type": "string", "maxLength": 150},
                            "date":   {"type": "string", "maxLength": 30},
                            "url":    {"type": "string", "maxLength": 300},
                        },
                    },
                },
                "awards": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["name", "issuer", "date", "description"],
                        "properties": {
                            "name":        {"type": "string", "maxLength": 200},
                            "issuer":      {"type": "string", "maxLength": 150},
                            "date":        {"type": "string", "maxLength": 30},
                            "description": {"type": "string", "maxLength": 300},
                        },
                    },
                },
                "leadership_and_activities": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 250},
                },
                "interests": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 100},
                },
            },
        },
        "analysis": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "matched_keywords", "missing_keywords", "warnings", "match_score",
            ],
            "properties": {
                "matched_keywords": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 80},
                },
                "missing_keywords": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 80},
                },
                "warnings": {
                    "type": "array",
                    "maxItems": 5,
                    "items": {"type": "string", "maxLength": 300},
                },
                "match_score": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 100,
                },
            },
        },
    },
}

# ── Core function ─────────────────────────────────────────────────────────────

def tailor_cv(cv_text: str, job_description: str) -> dict:
    """
    Performs a strategic CV reconstruction for the target job description.
    Uses JSON Schema structured output for guaranteed format compliance.
    Retries up to 3 times on any failure before raising.
    """
    prompt = USER_PROMPT_TEMPLATE.format(
        cv_text=cv_text,
        job_description=job_description,
    )

    last_error = None
    for _ in range(3):
        try:
            resp = client.responses.create(
                model="gpt-5-mini",
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                reasoning={"effort": "medium"},
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "cv_tailoring_output",
                        "strict": True,
                        "schema": CV_SCHEMA,
                    }
                },
            )

            data = json.loads(resp.output_text)

            if "tailored_cv" not in data or "analysis" not in data:
                raise ValueError("Response missing required top-level keys")

            score = data["analysis"].get("match_score", -1)
            if not isinstance(score, int) or not (0 <= score <= 100):
                raise ValueError(f"match_score out of range: {score}")

            return data

        except Exception as e:
            last_error = e

    raise RuntimeError(
        f"AI failed to return valid structured output after 3 attempts. "
        f"Last error: {last_error}"
    )
