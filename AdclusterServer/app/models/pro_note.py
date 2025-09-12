from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class ProNote(Base):
    __tablename__ = "proNote"

    noteID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nodeID = Column(UUID(as_uuid=True), ForeignKey('proNodes.nodeID'), nullable=False)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    note_Descrtion = Column(Text)
    crtID = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    status = Column(Boolean, default=True)
    create_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    update_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    endDate = Column(Date)
    saveYear = Column(Integer)
    saveStatus = Column(Boolean, default=True)
    tmpID = Column(UUID(as_uuid=True), ForeignKey('myTempletes.tmpID'), nullable=False)
    style_id = Column(UUID(as_uuid=True), ForeignKey('myStyles.style_id'), nullable=False)