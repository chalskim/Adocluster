from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
from app.schemas.auth import TokenData
import uuid

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """Verify a JWT token and extract user data"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        username: Optional[str] = payload.get("sub")
        email: Optional[str] = payload.get("uemail")
        
        if user_id is None or username is None:
            raise credentials_exception
            
        # user_id를 UUID로 변환
        try:
            user_id = uuid.UUID(str(user_id))
        except (ValueError, TypeError):
            raise credentials_exception
            
        # 토큰 데이터 생성
        token_data = TokenData(user_id=user_id, uname=username, uemail=email)
        
    except JWTError:
        raise credentials_exception
    
    return token_data