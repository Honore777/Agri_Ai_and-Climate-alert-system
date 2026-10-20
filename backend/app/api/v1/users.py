from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from typing import List, Optional

import secrets

from app.schemas.user import (
    UserCreate, UserRead, UserAdminRead, UserStatusUpdate,
    UserSelfUpdate, PasswordResetResponse,
    CoordinatesUpdate, AdminLocationUpdate, UserLocationRead
)
from app.models.user import User
from app.models.province import Province
from app.models.district import District
from app.models.sector import Sector
from app.models.cell import Cell
from app.models.village import Village
from app.database.deps import get_db
from app.core.security import (
    hash_password, verify_password, require_roles,
    validate_password, get_current_user
)



router= APIRouter(prefix='/users', tags=['Users'])

@router.post('/', response_model=UserRead, status_code=status.HTTP_201_CREATED)

def create_user(
    user:UserCreate,
    db:Session= Depends(get_db),
    current_user=Depends(require_roles('system_admin','org_admin'))

):
    # DEBUG: Log what we received
    print(f"\n[USER_CREATE] DEBUG REQUEST DATA:")
    print(f"  Email: {user.email}")
    print(f"  Full Name: {user.full_name}")
    print(f"  Phone Number: {user.phone_number}")
    print(f"  Password: {'*' * len(user.password)}")
    print(f"  Role: {user.role}")
    print(f"  Organization ID: {user.organization_id}")
    print(f"[USER_CREATE] ---\n")
    
    if not validate_password(user.password):
        raise HTTPException(
            status_code=400,
            detail='Weak password'
        )
    
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        hashed_password=hash_password(user.password),
        role=user.role,
        organization_id=user.organization_id,
        is_active=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.get('/me', response_model=UserRead)
def read_current_user(current_user:User=Depends(get_current_user)):

    return current_user


@router.put('/me', response_model=UserRead)
def update_my_profile(
    payload: UserSelfUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update own profile: email, full name, phone, password.

    Rules:
    - new_password requires current_password (identity proof)
    - email must remain unique
    """
    # Re-fetch through the request session (get_current_user returns detached)
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    data = payload.dict(exclude_unset=True)

    if 'email' in data and data['email'] != user.email:
        exists = db.query(User).filter(
            User.email == data['email'].lower(), User.id != user.id
        ).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Email already in use'
            )
        user.email = data['email'].lower()

    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']

    if data.get('new_password'):
        if not data.get('current_password'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Current password is required to set a new password'
            )
        if not verify_password(data['current_password'], user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Current password is incorrect'
            )
        if not validate_password(data['new_password']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='New password is too weak'
            )
        user.hashed_password = hash_password(data['new_password'])

    db.commit()
    db.refresh(user)
    return user


@router.post('/{user_id}/reset-password', response_model=PasswordResetResponse)
def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a temporary password for a member — the professional
    way for an admin to 'see' a user's password (hashes are one-way;
    nobody can read them back, so we reset instead).

    The temp password is returned ONCE, to be shared with the user,
    who then changes it via PUT /users/me.

    - system_admin: any user
    - cooperative_admin: own-org members only (not system admins, not self)
    """
    if current_user.role not in ('system_admin', 'cooperative_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Only admins can reset member passwords'
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found'
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Use PUT /users/me to change your own password'
        )

    if current_user.role == 'cooperative_admin':
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You can only manage members of your own organization'
            )
        if user.role == 'system_admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You cannot reset a system admin password'
            )

    # Passes validate_password: upper+lower+digit+special, 8+ chars
    temp_password = f"Agri{secrets.token_hex(3)}!9"
    user.hashed_password = hash_password(temp_password)
    db.commit()

    return PasswordResetResponse(
        user_id=user.id,
        email=user.email,
        temporary_password=temp_password,
    )


# ===== ADMIN USER MANAGEMENT =====

@router.get('/', response_model=List[UserAdminRead])
def list_users(
    organization_id: Optional[int] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List users for management.
    - system_admin: all users, optionally filtered by org/role/search
    - cooperative_admin: only members of their own organization
    - search: case-insensitive match on name/email/phone (autosuggest)
    Each row carries a human-readable location_path (Province > ... > Village).
    """
    if current_user.role == 'system_admin':
        query = db.query(User)
        if organization_id is not None:
            query = query.filter(User.organization_id == organization_id)
    elif current_user.role == 'cooperative_admin':
        query = db.query(User).filter(
            User.organization_id == current_user.organization_id
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Only admins can list users'
        )

    if role:
        query = query.filter(User.role == role)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.ilike(term))
            | (User.email.ilike(term))
            | (User.phone_number.ilike(term))
        )

    users = query.order_by(User.created_at.desc()).all()

    # Attach human-readable location for the admin cards
    for u in users:
        u.location_path = _build_location_path(u, db)

    return users


@router.patch('/{user_id}/status', response_model=UserAdminRead)
def set_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Activate/deactivate a user account.
    - system_admin: any user
    - cooperative_admin: only non-admin members of their own organization
    Deactivated users are blocked at login.
    """
    if current_user.role not in ('system_admin', 'cooperative_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Only admins can change user status'
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found'
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='You cannot deactivate your own account'
        )

    if current_user.role == 'cooperative_admin':
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You can only manage members of your own organization'
            )
        if user.role == 'system_admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You cannot change a system admin account'
            )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


# ===== LOCATION ENDPOINTS =====
#
# Two separate location concepts (see User model):
#   - Administrative hierarchy (province→...→village): drives agronomist
#     assignment and cooperative ownership. Updated via PUT /me/location.
#   - Geographic coordinates (lat/lon): drives Open-Meteo weather lookups.
#     Updated via PUT /me/coordinates.
# Changing admin location may reassign the farmer to a different agronomist.
# Changing coordinates only affects FUTURE predictions — past weather
# snapshots are historical records and are never rewritten.

def _build_location_path(user: User, db: Session) -> str:
    """Walk the FK chain upward: village → cell → sector → district → province."""
    names = []
    for model, row_id in [
        (Village, user.village_id),
        (Cell, user.cell_id),
        (Sector, user.sector_id),
        (District, user.district_id),
        (Province, user.province_id),
    ]:
        if row_id is None:
            continue
        row = db.query(model).filter(model.id == row_id).first()
        if row:
            names.append(row.name)
    return " > ".join(reversed(names)) if names else None


def _location_response(user: User, db: Session) -> UserLocationRead:
    has_precise = (
        user.latitude is not None
        and user.longitude is not None
        and user.location_source == 'gps'
    )
    return UserLocationRead(
        province_id=user.province_id,
        district_id=user.district_id,
        sector_id=user.sector_id,
        cell_id=user.cell_id,
        village_id=user.village_id,
        location_path=_build_location_path(user, db),
        latitude=user.latitude,
        longitude=user.longitude,
        location_source=user.location_source,
        location_updated_at=user.location_updated_at,
        needs_precise_location=not has_precise,
    )


@router.get('/me/location', response_model=UserLocationRead)
def get_my_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the farmer's admin location path + GPS status."""
    return _location_response(current_user, db)


@router.put('/me/coordinates', response_model=UserLocationRead)
def update_my_coordinates(
    payload: CoordinatesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Store the farmer's GPS coordinates (browser Geolocation or manual)."""
    if payload.location_source not in ('gps', 'district_fallback', 'manual'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="location_source must be 'gps', 'district_fallback' or 'manual'"
        )
    # get_current_user returns a detached object from its own session —
    # re-fetch through this request's session so writes persist.
    user = db.query(User).filter(User.id == current_user.id).first()
    user.latitude = payload.latitude
    user.longitude = payload.longitude
    user.location_source = payload.location_source
    user.location_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return _location_response(user, db)


@router.put('/me/location', response_model=UserLocationRead)
def update_my_admin_location(
    payload: AdminLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the farmer's administrative location (province→village).

    Validation: every provided id must exist, and the resulting chain must be
    internally consistent (e.g. the village must belong to the cell). Levels
    not sent keep their current values.
    """
    provided = payload.dict(exclude_unset=True)
    if not provided:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No location fields provided"
        )

    # 1. Existence check for each provided level
    models = {
        'province_id': Province,
        'district_id': District,
        'sector_id': Sector,
        'cell_id': Cell,
        'village_id': Village,
    }
    for field, model in models.items():
        if field in provided and provided[field] is not None:
            if not db.query(model).filter(model.id == provided[field]).first():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{model.__tablename__} id {provided[field]} not found"
                )

    # Re-fetch through this request's session (get_current_user is detached)
    user = db.query(User).filter(User.id == current_user.id).first()

    # 2. Consistency check on the EFFECTIVE chain (provided value, else current)
    effective = {
        field: provided.get(field, getattr(user, field))
        for field in models
    }
    parent_of = {
        'district_id': ('province_id', District, 'province_id'),
        'sector_id': ('district_id', Sector, 'district_id'),
        'cell_id': ('sector_id', Cell, 'sector_id'),
        'village_id': ('cell_id', Village, 'cell_id'),
    }
    for field, (parent_field, model, parent_col) in parent_of.items():
        child_id, parent_id = effective[field], effective[parent_field]
        if child_id is None or parent_id is None:
            continue
        row = db.query(model).filter(model.id == child_id).first()
        if row and getattr(row, parent_col) != parent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inconsistent location: {field} {child_id} does not "
                       f"belong to {parent_field} {parent_id}"
            )

    # 3. Apply
    for field, value in provided.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return _location_response(user, db)
    