from sqlalchemy import Column, String, BigInteger, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    file_key = Column(String(255), unique=True, nullable=False)
    mime_type = Column(String(255))
    size = Column(BigInteger)
    file_metadata = Column('metadata', JSON)  # Renamed to avoid conflict with SQLAlchemy reserved keyword
    created_at = Column(DateTime, default=datetime.utcnow)