from datetime import datetime, timedelta

from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.database.session import SessionLocal
from .config import SECRET_KEY,ALGORITHM,ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordBearer
from .password_utils import hash_password, verify_password, validate_password

import re


oauth2_scheme= OAuth2PasswordBearer(tokenUrl='login')




def create_access_token(data:dict, expires_delta:timedelta=None):
    to_encode=data.copy()
    expire=datetime.utcnow()+(expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp':expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

def get_current_user(token:str=Depends(oauth2_scheme)):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id= payload.get('sub')
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='invalid token')
        
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='invalid token')
    
    db=SessionLocal()

    user=db.query(User).filter(User.id==int(user_id)).first()
    db.close()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='User not found')
    
    return user

def require_roles(*allowed_roles):

    def role_checker(user:User=Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You do not have permission'
            )
        return user
    return role_checker
    
    