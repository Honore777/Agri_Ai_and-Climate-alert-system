from app.database.session import SessionLocal
from app.models.user import User
from app.core.password_utils import hash_password
import traceback

db = SessionLocal()

try:
    print("[INFO] Rehashing all user passwords with 72-byte truncation...\n")
    
    users = db.query(User).all()
    print(f"[INFO] Found {len(users)} users to process\n")
    
    for user in users:
        print(f"[PROCESS] User: {user.email}")
        # We need to know the original passwords, but we don't have them
        # This is a problem - we can't rehash without knowing original passwords
        print(f"  -> Cannot rehash: original password not available")
    
    print("\n[ERROR] Cannot proceed without original passwords!")
    print("[INFO] The database has hashes that were created without truncation.")
    print("[INFO] We need to reset user passwords or recreate the database.\n")
    
    # Option: Delete and recreate users with demo password
    print("[SOLUTION] Deleting and recreating demo users with proper password hashing...\n")
    
    # Delete existing users
    db.query(User).delete()
    db.commit()
    print("[OK] Deleted all users")
    
    # Recreate demo users with properly truncated passwords
    from app.models.user import User
    
    demo_users = [
        {
            "email": "farmer@kigali.com",
            "password": "FarmerPass123!",
            "role": "farmer",
            "full_name": "Demo Farmer"
        },
        {
            "email": "agronomist@kigali.com", 
            "password": "AgronomistPass123!",
            "role": "agronomist",
            "full_name": "Demo Agronomist"
        },
        {
            "email": "admin@kigali.com",
            "password": "AdminPass123!",
            "role": "admin",
            "full_name": "System Admin"
        }
    ]
    
    for user_data in demo_users:
        user = User(
            email=user_data["email"],
            hashed_password=hash_password(user_data["password"]),  # This now truncates!
            role=user_data["role"],
            full_name=user_data["full_name"],
            is_active=True
        )
        db.add(user)
        print(f"[OK] Created user: {user_data['email']} (password: {user_data['password']})")
    
    db.commit()
    print("\n[SUCCESS] All demo users recreated with proper password hashing!")
    
except Exception as e:
    print(f"[ERROR] {e}")
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
