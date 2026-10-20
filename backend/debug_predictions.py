"""
Debug script to see if agronomist can see farmer predictions
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.models.prediction import Prediction
from app.models.assignment import Assignment
from app.models.validation import Validation
from app.database.session import DATABASE_URL

# Create session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

print("\n" + "="*80)
print("🔍 DEBUGGING PREDICTIONS VISIBILITY")
print("="*80)

# Find agronomist
agronomist = db.query(User).filter(User.role == 'agronomist').first()
if not agronomist:
    print("❌ No agronomist found!")
    sys.exit(1)

print(f"\n👨‍🌾 Agronomist: {agronomist.email}")
print(f"   ID: {agronomist.id}")

# Find assignments
assignments = db.query(Assignment).filter(
    Assignment.agronomist_id == agronomist.id,
    Assignment.is_active == True
).all()

print(f"\n📍 Assignments: {len(assignments)}")
for assignment in assignments:
    print(f"   - Village ID: {assignment.village_id} ({assignment.village.name if assignment.village else 'None'})")
    print(f"   - Cell ID: {assignment.cell_id} ({assignment.cell.name if assignment.cell else 'None'})")
    print(f"   - Sector ID: {assignment.sector_id} ({assignment.sector.name if assignment.sector else 'None'})")
    print(f"   - District ID: {assignment.district_id} ({assignment.district.name if assignment.district else 'None'})")
    print(f"   - Province ID: {assignment.province_id} ({assignment.province.name if assignment.province else 'None'})")

# Find farmers
farmers = db.query(User).filter(User.role == 'farmer').all()
print(f"\n👩‍🌾 Farmers: {len(farmers)}")
for farmer in farmers:
    print(f"   - {farmer.email}")
    print(f"     Province: {farmer.province_id}, District: {farmer.district_id}, Sector: {farmer.sector_id}, Cell: {farmer.cell_id}, Village: {farmer.village_id}")

# Check predictions
predictions = db.query(Prediction).all()
print(f"\n📸 Predictions: {len(predictions)}")
for pred in predictions:
    farmer = db.query(User).filter(User.id == pred.farmer_id).first()
    print(f"   - ID {pred.id}: Farmer {farmer.email if farmer else 'Unknown'}")
    print(f"     Created: {pred.created_at}")
    
    # Check if validated
    validation = db.query(Validation).filter(Validation.prediction_id == pred.id).first()
    print(f"     Validated: {'Yes' if validation else 'No'}")

# Now simulate the query
print(f"\n🔎 SIMULATING AGRONOMIST QUERY")
print("="*80)

farmer_ids = set()

for assignment in assignments:
    if assignment.village_id:
        village_farmers = db.query(User).filter(
            User.village_id == assignment.village_id
        ).all()
        print(f"Farmers in village {assignment.village_id}: {len(village_farmers)}")
        farmer_ids.update([f.id for f in village_farmers])
    elif assignment.cell_id:
        cell_farmers = db.query(User).filter(
            User.cell_id == assignment.cell_id
        ).all()
        print(f"Farmers in cell {assignment.cell_id}: {len(cell_farmers)}")
        farmer_ids.update([f.id for f in cell_farmers])
    elif assignment.sector_id:
        sector_farmers = db.query(User).filter(
            User.sector_id == assignment.sector_id
        ).all()
        print(f"Farmers in sector {assignment.sector_id}: {len(sector_farmers)}")
        for f in sector_farmers:
            print(f"   - {f.email} (ID {f.id})")
        farmer_ids.update([f.id for f in sector_farmers])
    elif assignment.district_id:
        district_farmers = db.query(User).filter(
            User.district_id == assignment.district_id
        ).all()
        print(f"Farmers in district {assignment.district_id}: {len(district_farmers)}")
        farmer_ids.update([f.id for f in district_farmers])
    elif assignment.province_id:
        province_farmers = db.query(User).filter(
            User.province_id == assignment.province_id
        ).all()
        print(f"Farmers in province {assignment.province_id}: {len(province_farmers)}")
        farmer_ids.update([f.id for f in province_farmers])

print(f"\n✅ Total farmer IDs that match: {len(farmer_ids)}")
print(f"   Farmer IDs: {farmer_ids}")

if farmer_ids:
    # Check predictions from these farmers
    validated_prediction_ids = db.query(Validation.prediction_id).distinct().all()
    validated_ids = [v[0] for v in validated_prediction_ids]
    
    print(f"\n📊 Validated prediction IDs: {validated_ids}")
    
    from sqlalchemy import not_
    pending = db.query(Prediction).filter(
        Prediction.farmer_id.in_(list(farmer_ids))
    )
    
    if validated_ids:
        pending = pending.filter(not_(Prediction.id.in_(validated_ids)))
    
    pending_predictions = pending.all()
    
    print(f"✅ PENDING PREDICTIONS FOR AGRONOMIST: {len(pending_predictions)}")
    for pred in pending_predictions:
        print(f"   - ID {pred.id}")
else:
    print("❌ NO FARMERS MATCH - Check assignments!")

db.close()
