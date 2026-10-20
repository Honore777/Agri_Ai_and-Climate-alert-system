from passlib.context import CryptContext
import re

# Single CryptContext instance for bcrypt hashing
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# BCRYPT_MAX_BYTES: bcrypt can only handle passwords up to 72 bytes
# This is a hard limitation of the bcrypt algorithm
BCRYPT_MAX_BYTES = 72


def _truncate_password(password: str) -> str:
    """
    Truncate password to 72 bytes max for bcrypt compatibility.
    
    bcrypt has a hard 72-byte limit. This function ensures passwords
    never exceed that limit by truncating at the byte level.
    This is simple, bulletproof, and compatible with existing passwords.
    
    Args:
        password: Plain text password
        
    Returns:
        Password truncated to ≤ 72 bytes
    """
    password_bytes = password.encode('utf-8')
    
    # If password is within bcrypt's limit, use as-is
    if len(password_bytes) <= BCRYPT_MAX_BYTES:
        return password
    
    # Truncate to exactly 72 bytes, then decode back to string
    # Using errors='ignore' to handle any incomplete UTF-8 sequences
    return password_bytes[:BCRYPT_MAX_BYTES].decode('utf-8', errors='ignore')


def validate_password(password: str) -> bool:
    """
    Validate password meets security requirements:
    - At least 8 characters
    - At most 128 characters (reasonable practical limit)
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 digit
    - At least 1 special character
    
    Returns: True if valid, False otherwise
    """
    # Check length constraints
    if len(password) < 8:
        return False
    if len(password) > 128:
        # Password is too long - prevent excessive memory usage
        return False
    
    # Check character requirements
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}<>]", password):
        return False
    
    return True


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt via passlib.
    
    Passwords are truncated to 72 bytes before hashing to stay within
    bcrypt's hard byte limit.
    
    Args:
        password: Plain text password
        
    Returns:
        bcrypt hash string
    """
    # Truncate password to stay within bcrypt's 72-byte limit
    prepared_password = _truncate_password(password)
    
    # Hash with bcrypt via passlib
    return pwd_context.hash(prepared_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against bcrypt hash.
    
    Same preprocessing as hash_password to ensure consistency
    for long passwords (> 72 bytes).
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: bcrypt hash to verify against
        
    Returns:
        True if password matches, False otherwise
    """
    # Prepare password same way as during hashing
    prepared_password = _truncate_password(plain_password)
    
    try:
        return pwd_context.verify(prepared_password, hashed_password)
    except Exception as e:
        # Return False for any verification errors
        # (invalid hash format, password mismatch, etc.)
        return False
