from sqlalchemy import Column, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class PnoteHistory(Base):
    __tablename__ = "pnote_history"

    phID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    noteID = Column(UUID(as_uuid=True), ForeignKey('proNote.noteID'), nullable=False)
    nodeID = Column(UUID(as_uuid=True), ForeignKey('proNodes.nodeID'), nullable=False)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    phUserID = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    phModify = Column(Text)
    phText = Column(Text)
    phModifySRange = Column(Integer, default=0)
    phModifyERange = Column(Integer, default=0)
    phModifyDate = Column(TIMESTAMP(timezone=True))
    phCreateDate = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)