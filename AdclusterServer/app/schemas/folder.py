from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="폴더 이름")
    description: Optional[str] = Field(None, description="폴더 설명")

class FolderCreate(FolderBase):
    project_id: uuid.UUID = Field(..., description="프로젝트 ID")
    parent_id: Optional[int] = Field(None, description="상위 폴더 ID")

class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="폴더 이름")
    description: Optional[str] = Field(None, description="폴더 설명")
    parent_id: Optional[int] = Field(None, description="상위 폴더 ID")

class FolderResponse(FolderBase):
    id: int
    project_id: uuid.UUID
    parent_id: Optional[int]
    created_by: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class FolderTreeResponse(FolderResponse):
    children: List['FolderTreeResponse'] = []