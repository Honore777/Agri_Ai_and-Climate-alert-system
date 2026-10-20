"""
PASSWORD DIAGNOSTIC SCRIPT
==================================================
Tests password hashing and verification in isolation
to identify any bcrypt 72-byte truncation issues
"""

import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.password_utils import hash_password, verify_password, validate_password

def test_passwords():
    """Test password operations"""
    
    print("\n" + "="*70)
    print("🔐 PASSWORD DIAGNOSTIC TEST")
    print("="*70)
    
    test_passwords_list = [
        ("Admin@123", "System admin password"),
        ("Coop@123", "Cooperative admin password"),
        ("VeryLongPassword123!@#WithManyCharactersToTestByteLimitWarning", "Long password test"),
    ]
    
    for plain_password, description in test_passwords_list:
        print(f"\n{'─'*70}")
        print(f"📝 TEST: {description}")
        print(f"{'─'*70}")
        
        # 1. Validate
        print(f"\n1️⃣  Validating password: '{plain_password}'")
        try:
            is_valid = validate_password(plain_password)
            print(f"   ✅ Validation result: {'PASS' if is_valid else 'FAIL'}")
            if not is_valid:
                print(f"   ❌ Password validation FAILED but no exception thrown")
                continue
        except Exception as e:
            print(f"   ❌ Validation error: {e}")
            continue
        
        # 2. Check byte length
        password_bytes = plain_password.encode('utf-8')
        print(f"\n2️⃣  Byte length: {len(password_bytes)} bytes")
        if len(password_bytes) > 72:
            print(f"   ⚠️  WARNING: Password exceeds 72 bytes (bcrypt limit)")
            print(f"   ℹ️  Passlib should truncate internally, monitoring...")
        
        # 3. Hash the password
        print(f"\n3️⃣  Hashing password...")
        try:
            hashed = hash_password(plain_password)
            print(f"   ✅ Hash successful")
            print(f"   🔒 Hash (first 50 chars): {hashed[:50]}...")
            print(f"   📏 Hash length: {len(hashed)} characters")
        except Exception as e:
            print(f"   ❌ Hashing error: {e}")
            import traceback
            traceback.print_exc()
            continue
        
        # 4. Verify the password
        print(f"\n4️⃣  Verifying password against hash...")
        try:
            is_correct = verify_password(plain_password, hashed)
            print(f"   ✅ Verification result: {'SUCCESS' if is_correct else 'FAILED'}")
            if not is_correct:
                print(f"   ❌ Password verification FAILED")
        except ValueError as e:
            if "72 bytes" in str(e):
                print(f"   ❌ 72-BYTE LIMIT EXCEEDED: {e}")
                print(f"   ⚠️  THIS IS THE BUG WE'RE TRACKING!")
            else:
                print(f"   ❌ ValueError: {e}")
            import traceback
            traceback.print_exc()
            continue
        except Exception as e:
            print(f"   ❌ Verification error: {e}")
            import traceback
            traceback.print_exc()
            continue
        
        # 5. Try with wrong password
        print(f"\n5️⃣  Testing with WRONG password...")
        try:
            is_wrong_rejected = not verify_password(plain_password + "WRONG", hashed)
            print(f"   ✅ Wrong password correctly rejected: {is_wrong_rejected}")
        except Exception as e:
            print(f"   ⚠️  Error with wrong password: {e}")
    
    print("\n" + "="*70)
    print("✨ DIAGNOSTIC TEST COMPLETE")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_passwords()
