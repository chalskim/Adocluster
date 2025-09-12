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

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None

class ProjectResponse(ProjectBase):
    prjID: uuid.UUID
    crtID: uuid.UUID
    created_at: datetime
    update_at: datetime

    class Config:
        orm_mode = True
        fields = {
            "prjID": "prjid",
            "crtID": "crtid",
            "created_at": "created_at",
            "update_at": "update_at"
        }
        json_encoders = {
            uuid.UUID: lambda v: str(v)
        }