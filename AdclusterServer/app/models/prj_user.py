from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class PrjUser(Base):
    __tablename__ = "prjuser"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    role = Column(String(50), default='reader')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=datetime.utcnow)
    update_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)