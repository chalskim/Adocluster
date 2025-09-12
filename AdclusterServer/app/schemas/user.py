from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    uemail: str
    urole: Optional[str] = 'user'
    uname: Optional[str] = 'anonymous'
    uavatar: Optional[str] = None
    uisdel: Optional[bool] = False
    uactive: Optional[bool] = True

class UserCreate(UserBase):
    upassword: str

class UserUpdate(BaseModel):
    uname: Optional[str] = None
    upassword: Optional[str] = None
    uavatar: Optional[str] = None

class User(UserBase):
    uid: uuid.UUID
    ucreate_at: Optional[datetime] = None
    ulast_login: Optional[datetime] = None
    uupdated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        json_encoders = {
            uuid.UUID: lambda v: str(v)
        }