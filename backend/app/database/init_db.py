"""
INIT_DB.PY - Database Bootstrap Script
=======================================

Initializes database with:
- Location hierarchy (provinces → districts → sectors → cells → villages)
- System Admin user
- Demo Organization (Cooperative)
- Demo users (Cooperative Admin, Farmer, Agronomist)
- Registration codes for demo users

Idempotent: Safe to run multiple times
Usage: python -m app.database.init_db
"""

import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.password_utils import hash_password
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village
from app.models.organization import Organization
from app.models.user import User
from app.models.registration_code import RegistrationCode
from app.models.image import Image  # Import to avoid circular dependency issues
from app.models.audit_log import AuditLog  # Import to avoid circular dependency issues
from app.models.assignment import Assignment  # Import to avoid circular dependency issues
from app.models.prediction import Prediction  # Import to avoid circular dependency issues


def load_locations_data():
    """Load Rwanda locations from JSON file (flattened format from GitHub)"""
    # Try new format first (flattened from GitHub)
    json_path_raw = Path(__file__).parent.parent.parent / "data" / "rwanda_locations_raw.json"
    
    if json_path_raw.exists():
        with open(json_path_raw, 'r', encoding='utf-8') as f:
            return json.load(f)  # Returns flattened list format
    
    # Fallback to old format (nested)
    json_path_old = Path(__file__).parent.parent.parent / "data" / "rwanda_locations.json"
    
    if json_path_old.exists():
        with open(json_path_old, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Convert nested format to flattened format
            return convert_nested_to_flat(data) if isinstance(data, dict) else data
    
    raise FileNotFoundError(f"Location data file not found: {json_path_raw} or {json_path_old}")


def convert_nested_to_flat(nested_data):
    """Convert nested format to flattened format for compatibility"""
    flat = []
    for prov in nested_data.get("provinces", []):
        for dist in prov.get("districts", []):
            for sect in dist.get("sectors", []):
                for cell in sect.get("cells", []):
                    for village in cell.get("villages", []):
                        flat.append({
                            "province_name": prov["name"],
                            "district_name": dist["name"],
                            "sector_name": sect["name"],
                            "cell_name": cell["name"],
                            "village_name": village if isinstance(village, str) else village["name"]
                        })
    return flat


def create_locations(db: Session):
    """
    Create location hierarchy from JSON data (flattened format).
    Pattern: Province → District → Sector → Cell → Village
    Idempotent: Check if exists before creating
    """
    
    print("📍 Creating location hierarchy from Rwanda data...")
    locations_data = load_locations_data()
    
    # Track what we've created to avoid duplicates
    provinces_created = set()
    districts_created = set()
    sectors_created = set()
    cells_created = set()
    villages_created = set()
    
    # Process flattened data
    for row in locations_data:
        # Extract location names (handle both GitHub format and nested format)
        province_name = row.get("province_name") or row.get("province")
        district_name = row.get("district_name") or row.get("district")
        sector_name = row.get("sector_name") or row.get("sector")
        cell_name = row.get("cell_name") or row.get("cell")
        village_name = row.get("village_name") or row.get("village")
        
        # Create Province
        if province_name and province_name not in provinces_created:
            province = db.query(Province).filter(
                Province.name == province_name
            ).first()
            
            if not province:
                province = Province(name=province_name)
                db.add(province)
                db.commit()
                db.refresh(province)
                print(f"  ✓ Created Province: {province.name}")
            
            provinces_created.add(province_name)
        else:
            province = db.query(Province).filter(
                Province.name == province_name
            ).first()
        
        if not province:
            continue
        
        # Create District
        district_key = f"{province_name}|{district_name}"
        if district_name and district_key not in districts_created:
            district = db.query(District).filter(
                District.name == district_name,
                District.province_id == province.id
            ).first()
            
            if not district:
                district = District(
                    name=district_name,
                    province_id=province.id
                )
                db.add(district)
                db.commit()
                db.refresh(district)
                print(f"    ✓ Created District: {district.name}")
            
            districts_created.add(district_key)
        else:
            district = db.query(District).filter(
                District.name == district_name,
                District.province_id == province.id
            ).first()
        
        if not district:
            continue
        
        # Create Sector
        sector_key = f"{district_name}|{sector_name}"
        if sector_name and sector_key not in sectors_created:
            sector = db.query(Sector).filter(
                Sector.name == sector_name,
                Sector.district_id == district.id
            ).first()
            
            if not sector:
                sector = Sector(
                    name=sector_name,
                    district_id=district.id
                )
                db.add(sector)
                db.commit()
                db.refresh(sector)
                print(f"      ✓ Created Sector: {sector.name}")
            
            sectors_created.add(sector_key)
        else:
            sector = db.query(Sector).filter(
                Sector.name == sector_name,
                Sector.district_id == district.id
            ).first()
        
        if not sector:
            continue
        
        # Create Cell
        cell_key = f"{sector_name}|{cell_name}"
        if cell_name and cell_key not in cells_created:
            cell = db.query(Cell).filter(
                Cell.name == cell_name,
                Cell.sector_id == sector.id
            ).first()
            
            if not cell:
                cell = Cell(
                    name=cell_name,
                    sector_id=sector.id
                )
                db.add(cell)
                db.commit()
                db.refresh(cell)
                print(f"        ✓ Created Cell: {cell.name}")
            
            cells_created.add(cell_key)
        else:
            cell = db.query(Cell).filter(
                Cell.name == cell_name,
                Cell.sector_id == sector.id
            ).first()
        
        if not cell:
            continue
        
        # Create Village
        village_key = f"{cell_name}|{village_name}"
        if village_name and village_key not in villages_created:
            village = db.query(Village).filter(
                Village.name == village_name,
                Village.cell_id == cell.id
            ).first()
            
            if not village:
                village = Village(
                    name=village_name,
                    cell_id=cell.id
                )
                db.add(village)
                db.commit()
                db.refresh(village)
            
            villages_created.add(village_key)
    
    print(f"\n✓ Loaded {len(provinces_created)} provinces, {len(districts_created)} districts, "
          f"{len(sectors_created)} sectors, {len(cells_created)} cells, {len(villages_created)} villages")
    
    # Return dictionary of key locations for use in assignments and registration codes
    locations = {}
    
    # Get some key locations for assignments and registration codes
    kigali_province = db.query(Province).filter(Province.name == "KIGALI").first()
    if kigali_province:
        locations["kigali_province"] = kigali_province
    
    gasabo_district = db.query(District).filter(District.name == "Gasabo").first()
    if gasabo_district:
        locations["gasabo"] = gasabo_district
    
    kicukiro_district = db.query(District).filter(District.name == "Kicukiro").first()
    if kicukiro_district:
        locations["kicukiro"] = kicukiro_district
    
    nyarugenge_district = db.query(District).filter(District.name == "Nyarugenge").first()
    if nyarugenge_district:
        locations["nyarugenge"] = nyarugenge_district
    
    # Get a sector for registration codes
    kicukiro_sector = db.query(Sector).filter(
        Sector.name.ilike("%kicukiro%"),
        Sector.district_id == kicukiro_district.id if kicukiro_district else None
    ).first() if kicukiro_district else None
    if kicukiro_sector:
        locations["kicukiro_sector"] = kicukiro_sector
    
    return locations


def create_system_admin(db: Session):
    """Create System Admin user if doesn't exist"""
    
    print("\n👤 Creating System Admin...")
    
    admin = db.query(User).filter(User.email == "admin@agri.com").first()
    
    if admin:
        print("  ℹ️  System Admin already exists")
        return admin
    
    admin = User(
        email="admin@agri.com",
        hashed_password=hash_password("AdminPass123!"),
        full_name="System Administrator",
        role="system_admin",
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"  ✓ Created System Admin: {admin.email}")
    
    return admin


def create_demo_organization(db: Session, system_admin: User):
    """Create demo Organization (Cooperative) with admin"""
    
    print("\n🏢 Creating Demo Organization...")
    
    # Create Organization
    org = db.query(Organization).filter(
        Organization.name == "Kigali Farmers Cooperative"
    ).first()
    
    if org:
        print("  ℹ️  Organization already exists")
        return org
    
    org = Organization(
        name="Kigali Farmers Cooperative",
        type="agricultural_cooperative",
        registration_code="KIGALI-COOP-001",
        region="Kigali City"
    )
    
    db.add(org)
    db.commit()
    db.refresh(org)
    print(f"  ✓ Created Organization: {org.name}")
    
    return org


def create_demo_users(db: Session, org: Organization, system_admin: User):
    """Create demo Cooperative Admin, Farmer, and Agronomist"""
    
    print("\n👥 Creating Demo Users...")
    
    # Get Gasabo District, Kicukiro Sector for demo users
    gasabo = db.query(District).filter(District.name == "Gasabo").first()
    kicukiro_sector = db.query(Sector).filter(Sector.name == "Kicukiro").first()
    kicukiro_cell = db.query(Cell).filter(Cell.name == "Kicukiro Cell A").first()
    village = db.query(Village).filter(Village.name == "Kicukiro Village 1").first()
    
    # Demo users data
    demo_users_data = [
        {
            "email": "coop_admin@kigali.com",
            "password": "CoopAdminPass123!",
            "full_name": "Cooperative Administrator",
            "role": "cooperative_admin",
            "code_role": None
        },
        {
            "email": "farmer@kigali.com",
            "password": "FarmerPass123!",
            "full_name": "Demo Farmer",
            "role": "farmer",
            "code_role": "farmer"
        },
        {
            "email": "agronomist@kigali.com",
            "password": "AgronomistPass123!",
            "full_name": "Demo Agronomist",
            "role": "agronomist",
            "code_role": "agronomist"
        }
    ]
    
    created_users = {}
    
    for user_data in demo_users_data:
        # Check if user exists
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        
        if existing:
            print(f"  ℹ️  User already exists: {user_data['email']}")
            created_users[user_data["role"]] = existing
            continue
        
        # Create user
        user = User(
            email=user_data["email"],
            hashed_password=hash_password(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            organization_id=org.id,
            province_id=gasabo.province_id if gasabo else None,
            district_id=gasabo.id if gasabo else None,
            sector_id=kicukiro_sector.id if kicukiro_sector else None,
            cell_id=kicukiro_cell.id if kicukiro_cell else None,
            village_id=village.id if village else None,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"  ✓ Created {user_data['role'].title()}: {user.email}")
        created_users[user_data["role"]] = user
        
        # Create registration code for non-admin users
        if user_data["code_role"]:
            code = RegistrationCode(
                code=f"DEMO-{user_data['code_role'].upper()}-{user.id}",
                role=user_data["code_role"],
                organization_id=org.id,
                province_id=gasabo.province_id if gasabo else None,
                district_id=gasabo.id if gasabo else None,
                sector_id=kicukiro_sector.id if kicukiro_sector else None,
                cell_id=kicukiro_cell.id if kicukiro_cell else None,
                village_id=village.id if village else None,
                is_active=True,
                expires_at=datetime.utcnow() + timedelta(days=30),
                created_by=system_admin.id
            )
            
            db.add(code)
            db.commit()
            print(f"    ✓ Created registration code: {code.code}")
    
    return created_users


def create_sample_assignments(db: Session, org: Organization, created_users: dict, locations: dict):
    """
    Create sample assignments to show how agronomists are assigned to regions.
    
    Purpose:
    - Agronomists need to be assigned to geographic regions
    - This determines which predictions they can see
    - Example: Agronomist John → assigned to Gasabo District
    - John will now see all predictions from farmers in Gasabo
    """
    
    print("\n📍 Creating sample assignments...")
    
    if "agronomist" not in created_users:
        print("  ℹ️  No agronomist to assign")
        return
    
    agronomist = created_users["agronomist"]
    
    # Check if assignment already exists
    existing_assignment = db.query(Assignment).filter(
        Assignment.agronomist_id == agronomist.id
    ).first()
    
    if existing_assignment:
        print(f"  ℹ️  Assignment already exists for {agronomist.full_name}")
        return
    
    # Assignment example 1: Assign agronomist to Gasabo District
    # This means: agronomist will validate predictions from Gasabo farmers
    gasabo_assignment = Assignment(
        agronomist_id=agronomist.id,                    # Which agronomist?
        organization_id=org.id,                         # Which organization?
        district_id=locations["gasabo"].id,            # Which location? (Gasabo District)
        created_by_id=db.query(User).filter(User.role == "system_admin").first().id,
        is_active=True
    )
    
    db.add(gasabo_assignment)
    db.commit()
    print(f"  ✓ Assigned {agronomist.full_name} to Gasabo District")
    
    # Optional: Create second agronomist for different region (if we had more agronomists)
    # assignment2 = Assignment(
    #     agronomist_id=agronomist2.id,
    #     organization_id=org.id,
    #     sector_id=locations["kicukiro_sector"].id,    # Assign to sector level
    #     created_by_id=system_admin.id,
    #     is_active=True
    # )
    # db.add(assignment2)
    # db.commit()


def create_sample_registration_codes(db: Session, org: Organization):
    """
    Create sample registration codes to show how admins distribute codes to new users.
    
    Purpose:
    - Admins generate codes for farmers/agronomists to register
    - Each code pre-fills the location and role
    - Example: Code "ABC123" = "Register as farmer in Gasabo District"
    - User enters code during registration → location auto-fills
    
    How it works in real workflow:
    1. Admin generates 50 codes for farmers in Gasabo
    2. Admin distributes codes to farmers (email, SMS, printed)
    3. Farmer clicks "Register" → enters code
    4. System auto-fills: role=farmer, province=Kigali, district=Gasabo
    5. Farmer only fills email, password, full_name
    """
    
    print("\n📋 Creating sample registration codes...")
    
    # Get locations for codes
    gasabo = db.query(District).filter(District.name == "Gasabo").first()
    kigali = db.query(Province).filter(Province.name == "KIGALI").first()
    
    if not gasabo or not kigali:
        print("  ℹ️  Locations not found, skipping codes")
        return
    
    # Check if sample codes already exist
    existing_codes = db.query(RegistrationCode).filter(
        RegistrationCode.code.like("SAMPLE%"),
        RegistrationCode.organization_id == org.id
    ).count()
    
    if existing_codes > 0:
        print(f"  ℹ️  {existing_codes} sample codes already exist")
        return
    
    system_admin = db.query(User).filter(User.role == "system_admin").first()
    
    # Create 5 sample farmer codes
    for i in range(5):
        code = RegistrationCode(
            code=f"SAMPLE-FARMER-{str(i+1).zfill(3)}",    # SAMPLE-FARMER-001, 002, 003...
            role="farmer",                                 # These codes are for farmers
            organization_id=org.id,                        # For Kigali Coop
            province_id=kigali.id,                         # Pre-fill: Kigali Province
            district_id=gasabo.id,                         # Pre-fill: Gasabo District
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(days=90),  # Valid for 90 days
            created_by=system_admin.id
        )
        db.add(code)
    
    db.commit()
    print(f"  ✓ Created 5 farmer registration codes (SAMPLE-FARMER-001 to 005)")
    
    # Create 2 sample agronomist codes
    for i in range(2):
        code = RegistrationCode(
            code=f"SAMPLE-AGRONOMIST-{str(i+1).zfill(3)}",  # SAMPLE-AGRONOMIST-001, 002...
            role="agronomist",                              # These codes are for agronomists
            organization_id=org.id,
            province_id=kigali.id,
            district_id=gasabo.id,
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(days=90),
            created_by=system_admin.id
        )
        db.add(code)
    
    db.commit()
    print(f"  ✓ Created 2 agronomist registration codes (SAMPLE-AGRONOMIST-001, 002)")


def init_db():
    """Main initialization function"""
    
    print("🚀 Initializing Database...\n")
    
    db = SessionLocal()
    
    try:
        # 1. Create locations
        locations = create_locations(db)
        
        # 2. Create System Admin
        system_admin = create_system_admin(db)
        
        # 3. Create Demo Organization
        org = create_demo_organization(db, system_admin)
        
        # 4. Create Demo Users
        created_users = create_demo_users(db, org, system_admin)
        
        # 5. Create sample assignments
        create_sample_assignments(db, org, created_users, locations)
        
        # 6. Create sample registration codes
        create_sample_registration_codes(db, org)
        
        print("\n✅ Database initialization complete!\n")
        print("📋 Demo Credentials:")
        print("  System Admin: admin@agri.com / AdminPass123!")
        print("  Coop Admin: coop_admin@kigali.com / CoopAdminPass123!")
        print("  Farmer: farmer@kigali.com / FarmerPass123!")
        print("  Agronomist: agronomist@kigali.com / AgronomistPass123!")
        print("\n📋 Sample Registration Codes:")
        print("  Farmer: SAMPLE-FARMER-001 through 005")
        print("  Agronomist: SAMPLE-AGRONOMIST-001, 002")
        print("\n🎯 Testing Workflow:")
        print("  1. Login as farmer@kigali.com → Upload crop image")
        print("  2. Login as agronomist@kigali.com → Validate prediction")
        print("  3. Login as coop_admin@kigali.com → Generate codes & assign agronomists")
        print()
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
