from pydantic import BaseModel, validator
from typing import Optional, Union, Any
from datetime import datetime
import uuid
import json

class ResourceBase(BaseModel):
    item_type: str
    title: str
    url: Optional[str] = None
    content: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    item_type: Optional[str] = None
    title: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None

class ResourceResponse(ResourceBase):
    item_id: uuid.UUID
    mlid: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

    @validator('content', pre=True)
    def convert_content_to_string(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v
        return json.dumps(v)