from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class MyCitation(Base):
    __tablename__ = "mycitations"

    citID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    citType = Column(String(50), nullable=False)
    citTitle = Column(String(255), nullable=False)
    citAuthor = Column(String(255))
    citPublisher = Column(String(255))
    citYear = Column(String(10))
    citURL = Column(Text)
    citDOI = Column(String(100))
    citISBN = Column(String(20))
    citISSN = Column(String(20))
    citVolume = Column(String(50))
    citIssue = Column(String(50))
    citPages = Column(String(50))
    citAbstract = Column(Text)
    citKeywords = Column(Text)
    citNotes = Column(Text)
    citCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    citUpdated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)