"""
SEED SCRIPT - Create System Admin User
=====================================

Minimal script to create only the system admin.
Everything else (org, agronomists, farmers) created through UI.

Usage:
    python seed_system_admin.py

Then login as:
    Email: admin@system.local
    Password: Admin@12345
"""

from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.user import User
from app.core.password_utils import hash_password
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

# Get session
db: Session = SessionLocal()

try:
    # Check if system admin already exists
    existing = db.query(User).filter(
        User.email == "admin@example.com"
    ).first()
    
    if existing:
        print("✅ System admin already exists")
        print(f"   Email: {existing.email}")
        print(f"   Created: {existing.created_at}")
    else:
        # Create system admin
        system_admin = User(
            email="admin@example.com",
            hashed_password=hash_password("Admin@12345"),
            full_name="System Administrator",
            role="system_admin",
            phone_number="+250700000000",
            is_active=True,
            organization_id=None,  # System admin not tied to org
        )
        
        db.add(system_admin)
        db.commit()
        db.refresh(system_admin)
        
        print("✅ System admin created successfully!")
        print(f"   ID: {system_admin.id}")
        print(f"   Email: {system_admin.email}")
        print(f"   Full Name: {system_admin.full_name}")
        print(f"   Password: Admin@12345")
        print()
        print("🔑 Login with these credentials to create organizations")

except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
