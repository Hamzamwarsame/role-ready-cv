"""
Idempotent DB migration. Run whenever the schema changes.
Usage: venv/bin/python migrate.py
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(".env")

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

DSN = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://", 1)

conn = psycopg2.connect(DSN)
conn.autocommit = True
cur = conn.cursor()

migrations = [
    # ── Original columns ────────────────────────────────────────────────────
    "ALTER TABLE tailor_runs ADD COLUMN IF NOT EXISTS cv_id INTEGER REFERENCES cvs(id)",
    "ALTER TABLE tailor_runs ADD COLUMN IF NOT EXISTS cv_text TEXT",

    # ── Users table (auth) ──────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )""",

    # ── Link CVs to users ───────────────────────────────────────────────────
    "ALTER TABLE cvs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)",
]

for sql in migrations:
    label = sql.strip().replace("\n", " ")[:70]
    print(f"Running: {label}...")
    cur.execute(sql)
    print("  OK")

cur.close()
conn.close()
print("\nAll migrations complete.")
