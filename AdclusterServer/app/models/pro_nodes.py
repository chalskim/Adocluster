from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class ProNode(Base):
    __tablename__ = "proNodes"

    nodeID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    prjID_parents = Column(UUID(as_uuid=True), ForeignKey('proNodes.nodeID'))
    type = Column(String(50), nullable=False, default='folder')
    title = Column(String(200), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)