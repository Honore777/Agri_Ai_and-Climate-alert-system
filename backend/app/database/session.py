import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load backend/.env into process environment (no-op if file is absent)
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# Database URL resolution:
#   USE_CLONE_DB=1 set in the terminal  → DATABASE_URL_CLONE (staging)
#   otherwise                           → DATABASE_URL (production Supabase)
#   no DATABASE_URL configured          → local SQLite fallback
#
# The flag is session-scoped on purpose: a new terminal always defaults
# to production, so testing on the clone is always an explicit choice.
backend_dir = Path(__file__).parent.parent.parent
_default_sqlite = f"sqlite:///{backend_dir / 'agri_ai.db'}"

_use_clone = os.getenv("USE_CLONE_DB", "").lower() in ("1", "true", "yes")

if _use_clone and os.getenv("DATABASE_URL_CLONE"):
    DATABASE_URL = os.environ["DATABASE_URL_CLONE"]
elif os.getenv("DATABASE_URL"):
    DATABASE_URL = os.environ["DATABASE_URL"]
else:
    DATABASE_URL = _default_sqlite

# 'check_same_thread' is a SQLite-only option; Postgres connections must not use it.
_connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,  # recycle stale connections (important for Supabase pooler)
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
