from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class ClbComment(Base):
    __tablename__ = "clbcomments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    noteID = Column(UUID(as_uuid=True), ForeignKey('proNote.noteID'), nullable=False)
    nodeID = Column(UUID(as_uuid=True), ForeignKey('proNodes.nodeID'), nullable=False)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    ctID = Column(UUID(as_uuid=True), nullable=False)  # Assuming this is a user ID or another entity
    ctDate = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    ctState = Column(String(20), default='begin')
    ctUpdate = Column(TIMESTAMP(timezone=True))
    ctEndDate = Column(TIMESTAMP(timezone=True))
    cCompleteID = Column(UUID(as_uuid=True))  # Assuming this is a user ID or another entity