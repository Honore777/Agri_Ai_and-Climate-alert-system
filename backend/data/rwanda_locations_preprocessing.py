from rwanda_locations import get_location_data
import json
from collections import defaultdict

print("🌍 Extracting Rwanda location data...")

records = get_location_data()  # Likely a list of strings

# Nested dictionary: Province -> District -> Sector -> Cell -> Villages
hierarchy = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))

for rec in records:
    # If rec is a string, split it by comma
    if isinstance(rec, str):
        parts = [p.strip() for p in rec.split(",")]
        if len(parts) != 5:
            continue  # skip malformed lines
        province, district, sector, cell, village = parts
    else:
        # If rec is already a dict (older version)
        province = rec["province_name"]
        district = rec["district_name"]
        sector = rec["sector_name"]
        cell = rec["cell_name"]
        village = rec["village_name"]

    hierarchy[province][district][sector][cell].append(village)

# Convert defaultdict to normal dict for JSON
def convert(d):
    if isinstance(d, defaultdict):
        d = {k: convert(v) for k, v in d.items()}
    return d

nested_locations = {"provinces": convert(hierarchy)}

# Save to JSON
output_path = "rwanda_full_hierarchy.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(nested_locations, f, ensure_ascii=False, indent=2)

print("✅ Nested Rwanda hierarchy created successfully!")
print(f"📁 Saved to: {output_path}")
