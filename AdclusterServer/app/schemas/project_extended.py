from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid

class ProjectExtendedResponse(BaseModel):
    """Extended project response with additional fields for notes and users count"""
    prjid: str
    crtid: str
    uname: str
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    status: str = "begin"
    notes: int = 0
    users: int = 0

    class Config:
        orm_mode = True
        json_encoders = {
            uuid.UUID: lambda v: str(v)
        }