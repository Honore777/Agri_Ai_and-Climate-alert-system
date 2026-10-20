from fastapi import APIRouter, Form, HTTPException, status,Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database.session import SessionLocal
from app.core.security import verify_password, create_access_token,hash_password,validate_password,get_current_user
from app.schemas.farmer import FarmerRegisterRequest, FarmerRegisterWithLocationRequest
from app.schemas.auth import LoginRequest, Token
from app.database.deps import get_db
from app.models.registration_code import RegistrationCode
from datetime import datetime




router = APIRouter(prefix='/auth',tags=['Auth'])

@router.post("/login")
def login(payload:LoginRequest,db:Session=Depends(get_db)):
    """
    Login with email and password
    Returns JWT token if successful
    """
    try:
        print(f"[AUTH] Login attempt for: {payload.email}")
        user=db.query(User).filter(User.email==payload.email).first()
        print(f"[AUTH] User query result: {user is not None}")

        if not user or not verify_password(payload.password, user.hashed_password):
            print(f"[AUTH] Login failed - invalid credentials")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # Account-level gate: deactivated users cannot log in
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Contact your administrator."
            )

        # Org-level gate: members of a deactivated organization are frozen out
        if user.organization_id:
            from app.models.organization import Organization
            org = db.query(Organization).filter(
                Organization.id == user.organization_id
            ).first()
            if org and not org.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your organization is currently deactivated. Contact support."
                )

        token = create_access_token({"sub": str(user.id), "role": user.role})
        print(f"[AUTH] Login successful for {payload.email}")
        
        # Extract first and last name from full_name
        full_name_parts = (user.full_name or 'User').split() if user.full_name else ['User']
        first_name = full_name_parts[0] if full_name_parts else 'User'
        last_name = ' '.join(full_name_parts[1:]) if len(full_name_parts) > 1 else ''
        
        return {
            'access_token': token,
            'token_type': 'bearer',
            'role': user.role,
            'user': {
                'id': user.id,
                'email': user.email,
                'user_role': user.role,
                'first_name': first_name,
                'last_name': last_name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


    

@router.post("/register/farmer", status_code=status.HTTP_201_CREATED)
def register_farmer(
    payload: FarmerRegisterRequest,
    db: Session = Depends(get_db)
):
    # 1. Validate registration code
    code = (
        db.query(RegistrationCode)
        .filter(
            RegistrationCode.code == payload.registration_code,
            RegistrationCode.is_active == True
        )
        .first()
    )

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired registration code"
        )

    # 2. Optional expiration check
    if code.expires_at and code.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Registration code has expired"
        )
    
    # 2B. Check code not already used
    if code.is_used:
        raise HTTPException(
            status_code=400,
            detail="This registration code has already been used"
        )

    # 3. Enforce role (security)
    if code.role != "farmer":
        raise HTTPException(
            status_code=403,
            detail="This registration code is not for farmers"
        )

    # 4. Validate password
    if not validate_password(payload.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be 8-128 characters with uppercase, lowercase, digit, and special character"
        )

    # 5. Prevent duplicate email
    existing_user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # 6. Create farmer user
    farmer = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=code.role,                      # from code
        organization_id=code.organization_id,# from code
        # ✅ FIXED: Set farmer's location from registration code
        province_id=code.province_id,
        district_id=code.district_id,
        sector_id=code.sector_id,
        cell_id=code.cell_id,
        village_id=code.village_id,
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    # ✅ NEW: Mark registration code as used
    code.is_used = True
    code.used_by_user_id = farmer.id
    db.commit()

    return {
        "message": "Farmer registered successfully"
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: FarmerRegisterWithLocationRequest,
    db: Session = Depends(get_db)
):
    """
    Register new user with registration code + location selection.
    
    Accepts JSON payload with:
    - email, password, registration_code
    - location: province_id, district_id, sector_id, cell_id, village_id
    
    Code determines: role, organization
    User selects: location
    """
    from datetime import datetime
    
    # ===== STEP 1: Validate email not duplicate =====
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # ===== STEP 2: Validate password strength =====
    if not validate_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be 8-128 characters with uppercase, lowercase, digit, and special character"
        )
    
    # ===== STEP 3: Look up registration code =====
    reg_code = db.query(RegistrationCode).filter(
        RegistrationCode.code == payload.registration_code
    ).first()
    
    if not reg_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid registration code"
        )
    
    # ===== STEP 4: Validate code is active =====
    if not reg_code.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration code is no longer active"
        )
    
    # ===== STEP 5: Validate code not expired =====
    if reg_code.expires_at and reg_code.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration code has expired"
        )
    
    # ===== STEP 5B: Validate code not already used =====
    if reg_code.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This registration code has already been used"
        )
    
    # ===== STEP 5C: Validate the code's organization is still active =====
    if reg_code.organization_id:
        from app.models.organization import Organization
        org = db.query(Organization).filter(
            Organization.id == reg_code.organization_id
        ).first()
        if org and not org.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This organization's registration is currently suspended"
            )

    # ===== STEP 6: Validate location fields exist in DB =====
    from app.models.province import Province
    from app.models.district import District
    from app.models.sector import Sector
    from app.models.cell import Cell
    from app.models.village import Village
    
    # Check each location level exists
    province = db.query(Province).filter(Province.id == payload.province_id).first()
    if not province:
        raise HTTPException(status_code=400, detail="Invalid province")
    
    district = db.query(District).filter(District.id == payload.district_id).first()
    if not district:
        raise HTTPException(status_code=400, detail="Invalid district")
    
    sector = db.query(Sector).filter(Sector.id == payload.sector_id).first()
    if not sector:
        raise HTTPException(status_code=400, detail="Invalid sector")
    
    cell = db.query(Cell).filter(Cell.id == payload.cell_id).first()
    if not cell:
        raise HTTPException(status_code=400, detail="Invalid cell")
    
    village = db.query(Village).filter(Village.id == payload.village_id).first()
    if not village:
        raise HTTPException(status_code=400, detail="Invalid village")
    
    # ===== STEP 7: Create new user =====
    hashed_password = hash_password(payload.password)
    new_user = User(
        email=payload.email.lower(),
        hashed_password=hashed_password,
        phone_number=payload.phone_number,     # ✅ Required by User model
        full_name=payload.full_name,           # ✅ Optional
        role=reg_code.role,                    # FROM CODE
        organization_id=reg_code.organization_id,  # FROM CODE
        province_id=payload.province_id,       # FROM USER
        district_id=payload.district_id,       # FROM USER
        sector_id=payload.sector_id,           # FROM USER
        cell_id=payload.cell_id,               # FROM USER
        village_id=payload.village_id,         # FROM USER
        is_active=True
    )
    
    # ===== STEP 8: Save user to database =====
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # ===== STEP 9: Mark code as used =====
    reg_code.is_active = False
    reg_code.is_used = True
    reg_code.used_by_user_id = new_user.id
    db.commit()
    
    # ===== STEP 10: Return success =====
    return {
        "message": f"✅ Account created! Welcome {new_user.role.title()} in {village.name}",
        "email": new_user.email,
        "role": new_user.role,
        "organization_id": new_user.organization_id,
        "village": village.name
    }


@router.post('/logout')
def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint - invalidates current user's token"""
    
    # current_user is a User object, not a dict
    user_id = current_user.id
    print(f"[audit] User {user_id} logged out")

    return {
        'message': 'logout successful',
        'user_id': user_id
    }