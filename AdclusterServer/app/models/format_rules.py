from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class FormatRule(Base):
    __tablename__ = "format_rules"

    rule_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey('format_categories.category_id'), nullable=False)
    style_id = Column(UUID(as_uuid=True), ForeignKey('myStyles.style_id'), nullable=False)
    element_name = Column(String(100), nullable=False)
    element_name_en = Column(String(100))
    element_code = Column(String(50))
    setting_value = Column(Text, nullable=False)
    example_note = Column(Text)
    css_selector = Column(String(200))
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)