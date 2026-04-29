import os
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.schemas import (
    TailorResponse,
    CVCreate, CVUpdate, CVOut, CVListOut,
    TailorFromCVRequest, TailorRunOut,
    UserCreate, UserLogin, UserOut, TokenOut,
)
from app.auth import hash_password, verify_password, create_access_token, decode_token, SECRET_KEY, ALGORITHM
from app.ai import tailor_cv
from app.db import SessionLocal, engine, Base
from app.models import TailorRun, CV, User
from app.export_docx import build_tailored_docx

# ── Admin credentials (env-overridable) ────────────────────────────────────────
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admincvtailor@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Deadpoolx.123")
ADMIN_TOKEN_EXPIRE_HOURS = 12

# ── Rate limiter ────────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="CV Tailor")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ────────────────────────────────────────────────────────────────────────
# Set CORS_ORIGINS env var to a comma-separated list of allowed origins.
# Defaults to localhost for development.

_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB dependency ──────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Auth dependency ────────────────────────────────────────────────────────────

_bearer = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "running"}

# ── Auth endpoints ─────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=TokenOut)
@limiter.limit("10/minute")
def register(request: Request, req: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=req.email.lower(), password_hash=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/login", response_model=TokenOut)
@limiter.limit("10/minute")
def login(request: Request, req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

# ── CV endpoints (auth-protected, user-scoped) ─────────────────────────────────

@app.get("/cvs", response_model=list[CVListOut])
def list_cvs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CV)
        .filter(CV.user_id == current_user.id)
        .order_by(CV.id.desc())
        .all()
    )


@app.post("/cv", response_model=CVOut)
def create_cv(
    req: CVCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = CV(title=req.title, cv_text=req.cv_text, user_id=current_user.id)
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@app.get("/cv/{cv_id}", response_model=CVOut)
def get_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


@app.put("/cv/{cv_id}", response_model=CVOut)
def update_cv(
    cv_id: int,
    req: CVUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    if req.title is not None:
        cv.title = req.title
    if req.cv_text is not None:
        cv.cv_text = req.cv_text
    db.commit()
    db.refresh(cv)
    return cv


@app.delete("/cv/{cv_id}", status_code=204)
def delete_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    # Delete all runs for this CV first (no cascade defined in ORM)
    db.query(TailorRun).filter(TailorRun.cv_id == cv_id).delete()
    db.delete(cv)
    db.commit()


@app.post("/cv/{cv_id}/tailor", response_model=TailorResponse)
@limiter.limit("30/hour")
def tailor_from_cv(
    request: Request,
    cv_id: int,
    req: TailorFromCVRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    try:
        output = tailor_cv(cv.cv_text, req.job_description)
        run = TailorRun(
            cv_id=cv.id,
            cv_text=cv.cv_text,
            job_description=req.job_description,
            output=output,
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cv/{cv_id}/runs", response_model=list[TailorRunOut])
def list_runs_for_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    runs = (
        db.query(TailorRun)
        .filter(TailorRun.cv_id == cv_id)
        .order_by(TailorRun.id.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "created_at": r.created_at,
            "cv_id": r.cv_id,
            "job_description": r.job_description,
            "output": r.output,
        }
        for r in runs
    ]


@app.get("/runs/{run_id}", response_model=TailorRunOut)
def get_run(
    run_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    run = (
        db.query(TailorRun)
        .join(CV, TailorRun.cv_id == CV.id)
        .filter(TailorRun.id == run_id, CV.user_id == current_user.id)
        .first()
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return {
        "id": run.id,
        "created_at": run.created_at,
        "cv_id": run.cv_id,
        "job_description": run.job_description,
        "output": run.output,
    }


@app.get("/runs/{run_id}/docx")
def export_run_docx(
    run_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    run = (
        db.query(TailorRun)
        .join(CV, TailorRun.cv_id == CV.id)
        .filter(TailorRun.id == run_id, CV.user_id == current_user.id)
        .first()
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    bio = build_tailored_docx(run_id=run.id, output=run.output)
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="tailored_cv_run_{run.id}.docx"'},
    )


# ── Admin auth helpers ─────────────────────────────────────────────────────────

def _create_admin_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ADMIN_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": "admin", "role": "admin", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def _require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> None:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")

# ── Admin endpoints ────────────────────────────────────────────────────────────

@app.post("/admin/login")
def admin_login(req: UserLogin):
    if req.email.lower() != ADMIN_EMAIL or req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"access_token": _create_admin_token(), "token_type": "bearer"}


@app.get("/admin/analytics")
def admin_analytics(
    _: None = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_cvs = db.query(func.count(CV.id)).scalar()
    total_runs = db.query(func.count(TailorRun.id)).scalar()
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    runs_this_week = db.query(func.count(TailorRun.id)).filter(TailorRun.created_at >= week_ago).scalar()
    new_users_this_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    recent_runs = (
        db.query(TailorRun, User.email)
        .join(CV, TailorRun.cv_id == CV.id)
        .join(User, CV.user_id == User.id)
        .order_by(TailorRun.created_at.desc())
        .limit(10)
        .all()
    )
    return {
        "total_users": total_users,
        "total_cvs": total_cvs,
        "total_runs": total_runs,
        "runs_this_week": runs_this_week,
        "new_users_this_week": new_users_this_week,
        "recent_runs": [
            {
                "run_id": r.TailorRun.id,
                "user_email": r.email,
                "created_at": r.TailorRun.created_at.isoformat(),
                "match_score": (r.TailorRun.output or {}).get("analysis", {}).get("match_score")
                    or (r.TailorRun.output or {}).get("match_score", 0),
            }
            for r in recent_runs
        ],
    }


@app.get("/admin/users")
def admin_list_users(
    _: None = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            User.id,
            User.email,
            User.created_at,
            func.count(CV.id.distinct()).label("cv_count"),
            func.count(TailorRun.id.distinct()).label("run_count"),
        )
        .outerjoin(CV, CV.user_id == User.id)
        .outerjoin(TailorRun, TailorRun.cv_id == CV.id)
        .group_by(User.id, User.email, User.created_at)
        .order_by(User.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "email": r.email,
            "created_at": r.created_at.isoformat(),
            "cv_count": r.cv_count,
            "run_count": r.run_count,
        }
        for r in rows
    ]


@app.delete("/admin/users/{user_id}", status_code=204)
def admin_delete_user(
    user_id: int,
    _: None = Depends(_require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    cv_ids = [c.id for c in db.query(CV.id).filter(CV.user_id == user_id).all()]
    if cv_ids:
        db.query(TailorRun).filter(TailorRun.cv_id.in_(cv_ids)).delete(synchronize_session=False)
        db.query(CV).filter(CV.user_id == user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()


# Create tables
Base.metadata.create_all(bind=engine)
