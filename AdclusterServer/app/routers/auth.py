from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token
from app.schemas.auth import Token, LoginRequest, UserCreate, UserResponse
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

class LoginData(BaseModel):
    uemail: str
    upassword: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.uname == form_data.username).first()
    if not user or not verify_password(form_data.password, user.upassword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active and not deleted
    if not user.uactive or user.uisdel:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated or deleted",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    from app.core.config import settings
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.uname, "uemail": user.uemail, "user_id": str(user.uid)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    email = login_data.get_email()
    print(f"Login attempt with email: {email}")
    print(f"Login data: {login_data}")
    try:
        # 사용자 조회
        user = db.query(User).filter(User.uemail == email).first()
        print(f"User found: {user}")
        
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active and not deleted
        if not user.uactive or user.uisdel:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated or deleted",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 비밀번호 검증
        if not verify_password(login_data.password, user.upassword):
            print("Password verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 토큰 생성
        from app.core.config import settings
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.uname, "uemail": user.uemail, "user_id": str(user.uid)},
            expires_delta=access_token_expires
        )
        print(f"Token generated successfully for user: {user.uname}")
        return {"access_token": access_token, "token_type": "bearer", "success": True}
    except Exception as e:
        print(f"Error during login: {str(e)}")
        raise

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = db.query(User).filter(User.uname == user_data.uname).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.uemail == user_data.uemail).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        uid=uuid.uuid4(),  # Add UUID for the user
        uemail=user_data.uemail,
        uname=user_data.uname,
        upassword=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user