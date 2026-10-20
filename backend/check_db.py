from app.database.session import SessionLocal
from app.models.province import Province
from app.models.district import District

db = SessionLocal()
provinces = db.query(Province).all()
print("Provinces in DB:")
for p in provinces:
    print(f"  - {p.name}")

# Also check districts
districts = db.query(District).all()
print(f"\nTotal Districts: {len(districts)}")
districts_to_check = db.query(District).filter(District.name.in_(["Gasabo", "Kicukiro", "Nyarugenge"])).all()
print("Key Districts in DB:")
for d in districts_to_check:
    prov = db.query(Province).filter(Province.id == d.province_id).first()
    print(f"  - {d.name} (province: {prov.name if prov else 'unknown'})")

db.close()
