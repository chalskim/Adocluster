from sqlalchemy import Column, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class Revision(Base):
    __tablename__ = "revisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_id = Column(UUID(as_uuid=True), ForeignKey('nodes.id', ondelete='CASCADE'), nullable=False)
    content_snapshot = Column(JSON)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)