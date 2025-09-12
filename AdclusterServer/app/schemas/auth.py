from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Token(BaseModel):
    access_token: str
    token_type: str
    success: Optional[bool] = None

class TokenData(BaseModel):
    uname: Optional[str] = None
    uemail: Optional[str] = None
    user_id: Optional[uuid.UUID] = None  # Changed from int to uuid.UUID
    exp: Optional[datetime] = None

class LoginRequest(BaseModel):
    uemail: Optional[str] = None
    email: Optional[str] = None
    password: str
    
    def get_email(self) -> str:
        """Return either uemail or email, prioritizing uemail"""
        return self.uemail or self.email or ""

class GoogleLoginRequest(BaseModel):
    token: str

class UserCreate(BaseModel):
    uemail: EmailStr
    uname: str
    password: str

class UserResponse(BaseModel):
    uid: uuid.UUID  # Use UUID type directly
    uemail: str
    uname: str
    uactive: bool
    urole: str
    ucreate_at: Optional[datetime] = None
    ulast_login: Optional[datetime] = None
    uupdated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        json_encoders = {
            uuid.UUID: lambda v: str(v)  # Add UUID encoder
        }
        # Add this to ensure proper serialization
        allow_population_by_field_name = True