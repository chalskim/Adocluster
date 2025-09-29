from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
import uuid

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: Optional[str] = "team"
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(ProjectBase):
    prjid: uuid.UUID
    crtid: uuid.UUID
    created_at: datetime
    update_at: datetime

    class Config:
        orm_mode = True
        fields = {
            "prjid": "prjid",
            "crtid": "crtid",
            "created_at": "created_at",
            "update_at": "update_at"
        }
        json_encoders = {
            uuid.UUID: lambda v: str(v)
        }