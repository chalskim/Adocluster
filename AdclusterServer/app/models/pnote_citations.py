from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class PnoteCitation(Base):
    __tablename__ = "pnote_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    noteID = Column(UUID(as_uuid=True), ForeignKey('proNote.noteID'), nullable=False)
    citID = Column(UUID(as_uuid=True), ForeignKey('mycitations.citID'), nullable=False)
    citOrder = Column(Integer, default=0)
    citPage = Column(String(50))
    citCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)