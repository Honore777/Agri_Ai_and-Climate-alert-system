"""
DEPENDENCIES.PY - Dependency Injection for API Routes
======================================================

Provides common dependencies like database sessions and authentication.
"""

from app.database.session import SessionLocal
from app.core.security import get_current_user

def get_db():
    """Dependency for getting a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["get_db", "get_current_user"]
