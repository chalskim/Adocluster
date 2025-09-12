from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP, JSONB
import uuid
from app.core.database import Base
from datetime import datetime

class GenSetting(Base):
    __tablename__ = "genSettings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uid = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    settingType = Column(String(50), nullable=False)
    settingKey = Column(String(100), nullable=False)
    settingValue = Column(JSONB)
    settingCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    settingUpdated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)