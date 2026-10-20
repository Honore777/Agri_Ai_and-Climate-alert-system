from app.database.session import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
print(f"Total users in database: {len(users)}")
for u in users:
    print(f"  - {u.email} ({u.role})")
db.close()
