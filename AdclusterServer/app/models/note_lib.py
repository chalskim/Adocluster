from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class NoteLib(Base):
    __tablename__ = "noteLib"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    noteID = Column(UUID(as_uuid=True), ForeignKey('proNote.noteID'), nullable=False)
    itemID = Column(UUID(as_uuid=True), ForeignKey('mylibitems.itemID'), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)