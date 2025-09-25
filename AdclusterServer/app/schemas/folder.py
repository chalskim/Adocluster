from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid

class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="폴더 이름")
    description: Optional[str] = Field(None, description="폴더 설명")

class FolderCreate(FolderBase):
    project_id: str = Field(..., description="프로젝트 ID")
    parent_id: Optional[str] = Field(None, description="상위 폴더 ID")
    
    @validator('project_id')
    def validate_project_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError('project_id must be a valid UUID')
    
    @validator('parent_id')
    def validate_parent_id(cls, v):
        if v is None:
            return v
        try:
            int(v)  # parent_id should be an integer in the database
            return v
        except ValueError:
            raise ValueError('parent_id must be a valid integer')

class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="폴더 이름")
    description: Optional[str] = Field(None, description="폴더 설명")
    parent_id: Optional[str] = Field(None, description="상위 폴더 ID")
    
    @validator('parent_id')
    def validate_parent_id(cls, v):
        if v is None:
            return v
        try:
            int(v)  # parent_id should be an integer in the database
            return v
        except ValueError:
            raise ValueError('parent_id must be a valid integer')

class FolderResponse(FolderBase):
    id: int  # folderid in database is Integer, not UUID
    project_id: str  # projectid in database is UUID
    parent_id: Optional[int]  # parentfolderid in database is Integer
    created_by: str  # creatorid in database is UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class FolderTreeResponse(FolderResponse):
    children: List['FolderTreeResponse'] = []
    # Inherit Config from parent class

# Update forward references
FolderTreeResponse.update_forward_refs()