from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class MyLib(Base):
    __tablename__ = "mylib"

    libID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    libName = Column(String(100), nullable=False)
    libDescription = Column(Text)
    libCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    libUpdated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    libOwnerID = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)