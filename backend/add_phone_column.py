"""Add missing phone_number column"""
import sqlite3

conn = sqlite3.connect('agri_ai.db')
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN phone_number VARCHAR NOT NULL DEFAULT ''")
    conn.commit()
    print("✅ phone_number column added")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    conn.close()
