from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class MyLibItem(Base):
    __tablename__ = "mylibitems"

    item_id = Column("item_id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mlid = Column("mlid", UUID(as_uuid=True), ForeignKey('mylib.mlid'), nullable=False)
    item_type = Column("item_type", String(50), nullable=False)
    title = Column("title", String(255), nullable=False)
    url = Column("url", Text)
    content = Column("content", Text)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)
    updated_at = Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)