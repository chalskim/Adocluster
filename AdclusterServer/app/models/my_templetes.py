from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class MyTemplete(Base):
    __tablename__ = "myTempletes"

    tmpID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tmpkind = Column(String(255))
    tmpdescription = Column(Text)
    tmpDisplay_order = Column(Integer, default=0)
    tmpCreated_at = Column(DateTime, default=datetime.utcnow)
    tmpUpdated_at = Column(DateTime)