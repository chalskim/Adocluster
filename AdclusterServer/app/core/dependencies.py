from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.database import get_db
from app.core.jwt import verify_token
from app.models.user import User as UserModel
from typing import Optional
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token, credentials_exception)
    
    # 수정: uid 필드 사용 (UUID 타입)
    if token_data.user_id is not None:
        # Ensure we're comparing UUIDs properly
        user = db.query(UserModel).filter(UserModel.uid == token_data.user_id).first()
        if user is None:
            raise credentials_exception
        
        return user
    else:
        raise credentials_exception


def get_current_active_user(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current active user"""
    # 모든 사용자를 활성 상태로 간주
    return current_user


def get_current_admin_user(
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get current admin user"""
    # Check if user has admin role instead of is_superuser attribute
    if current_user.urole != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user