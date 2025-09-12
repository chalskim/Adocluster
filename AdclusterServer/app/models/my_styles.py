from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class MyStyle(Base):
    __tablename__ = "myStyles"

    style_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    style_name = Column(String(100), nullable=False)
    style_name_en = Column(String(100))
    description = Column(Text)
    version = Column(String(20), default='1.0')
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)