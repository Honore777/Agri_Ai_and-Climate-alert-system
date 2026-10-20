"""
LOAD LOCATIONS - Populate Province/District/Sector/Cell/Village tables
=====================================================================

Loads Rwanda location hierarchy from JSON file into database.

Usage: python load_locations.py
"""

import json
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

# Import models
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village
from app.database.session import DATABASE_URL

def load_locations():
    """Load Rwanda locations from JSON into database"""
    
    print("\n" + "="*60)
    print("📍 LOADING RWANDA LOCATIONS")
    print("="*60)
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Load JSON data
        json_path = os.path.join(os.path.dirname(__file__), 'data', 'rwanda_locations_raw.json')
        print(f"\n📂 Loading from: {json_path}")
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📊 Total records: {len(data)}")
        
        # Extract unique provinces, districts, sectors, cells, villages
        provinces_dict = {}
        districts_dict = {}
        sectors_dict = {}
        cells_dict = {}
        villages_dict = {}
        
        for record in data:
            # Province
            prov_code = record.get('province_code')
            prov_name = record.get('province_name')
            if prov_code and prov_name:
                provinces_dict[prov_code] = prov_name
            
            # District
            dist_code = record.get('district_code')
            dist_name = record.get('district_name')
            if dist_code and dist_name:
                districts_dict[dist_code] = {
                    'name': dist_name,
                    'province_code': prov_code
                }
            
            # Sector
            sect_code = record.get('sector_code')
            sect_name = record.get('sector_name')
            if sect_code and sect_name:
                sectors_dict[sect_code] = {
                    'name': sect_name,
                    'district_code': dist_code
                }
            
            # Cell
            cell_code = record.get('cell_code')
            cell_name = record.get('cell_name')
            if cell_code and cell_name:
                cells_dict[cell_code] = {
                    'name': cell_name,
                    'sector_code': sect_code
                }
            
            # Village
            vill_code = record.get('village_code')
            vill_name = record.get('village_name')
            if vill_code and vill_name:
                villages_dict[vill_code] = {
                    'name': vill_name,
                    'cell_code': cell_code
                }
        
        # Check if already loaded
        existing_provinces = session.query(Province).count()
        if existing_provinces > 0:
            print(f"\n⚠️  Locations already loaded ({existing_provinces} provinces found)")
            print("   Skipping population...")
            return
        
        # Load Provinces
        print(f"\n1️⃣  Loading {len(provinces_dict)} provinces...")
        province_map = {}
        for code, name in provinces_dict.items():
            prov = Province(id=code, name=name)
            session.add(prov)
            province_map[code] = prov
        session.flush()
        print(f"   ✅ {len(provinces_dict)} provinces added")
        
        # Load Districts
        print(f"\n2️⃣  Loading {len(districts_dict)} districts...")
        district_map = {}
        for code, info in districts_dict.items():
            dist = District(
                id=code,
                name=info['name'],
                province_id=info['province_code']
            )
            session.add(dist)
            district_map[code] = dist
        session.flush()
        print(f"   ✅ {len(districts_dict)} districts added")
        
        # Load Sectors
        print(f"\n3️⃣  Loading {len(sectors_dict)} sectors...")
        sector_map = {}
        for code, info in sectors_dict.items():
            sect = Sector(
                id=code,
                name=info['name'],
                district_id=info['district_code']
            )
            session.add(sect)
            sector_map[code] = sect
        session.flush()
        print(f"   ✅ {len(sectors_dict)} sectors added")
        
        # Load Cells
        print(f"\n4️⃣  Loading {len(cells_dict)} cells...")
        cell_map = {}
        for code, info in cells_dict.items():
            cell = Cell(
                id=code,
                name=info['name'],
                sector_id=info['sector_code']
            )
            session.add(cell)
            cell_map[code] = cell
        session.flush()
        print(f"   ✅ {len(cells_dict)} cells added")
        
        # Load Villages
        print(f"\n5️⃣  Loading {len(villages_dict)} villages...")
        for code, info in villages_dict.items():
            vill = Village(
                id=code,
                name=info['name'],
                cell_id=info['cell_code']
            )
            session.add(vill)
        session.flush()
        print(f"   ✅ {len(villages_dict)} villages added")
        
        # Commit all
        session.commit()
        print("\n" + "="*60)
        print("✨ LOCATIONS LOADED SUCCESSFULLY!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   🏘️  Provinces:  {len(provinces_dict)}")
        print(f"   🏢 Districts:  {len(districts_dict)}")
        print(f"   🏘️  Sectors:    {len(sectors_dict)}")
        print(f"   🏠 Cells:      {len(cells_dict)}")
        print(f"   🏘️  Villages:   {len(villages_dict)}")
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    load_locations()
