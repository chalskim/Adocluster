from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class FormatCategory(Base):
    __tablename__ = "format_categories"

    category_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    style_id = Column(UUID(as_uuid=True), ForeignKey('myStyles.style_id'), nullable=False)
    category_name = Column(String(50), nullable=False)
    category_name_en = Column(String(50))
    icon = Column(Text)
    display_order = Column(Integer, default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)