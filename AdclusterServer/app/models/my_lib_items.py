from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class MyLibItem(Base):
    __tablename__ = "mylibitems"

    itemID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    libID = Column(UUID(as_uuid=True), ForeignKey('mylib.libID'), nullable=False)
    itemType = Column(String(50), nullable=False)
    itemTitle = Column(String(255), nullable=False)
    itemAuthor = Column(String(255))
    itemPublisher = Column(String(255))
    itemYear = Column(String(10))
    itemURL = Column(Text)
    itemDOI = Column(String(100))
    itemISBN = Column(String(20))
    itemISSN = Column(String(20))
    itemVolume = Column(String(50))
    itemIssue = Column(String(50))
    itemPages = Column(String(50))
    itemAbstract = Column(Text)
    itemKeywords = Column(Text)
    itemNotes = Column(Text)
    itemCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    itemUpdated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)