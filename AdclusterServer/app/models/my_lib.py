from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

class MyLib(Base):
    __tablename__ = "mylib"

    mlid = Column("mlid", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mltitle = Column("mltitle", String(100), nullable=False)
    type = Column("type", String(50), nullable=False)
    url = Column("url", Text)
    author = Column("author", String(200))
    publisher = Column("publisher", String(200))
    published_date = Column("published_date", Date)
    accessed_date = Column("accessed_date", Date, default=datetime.utcnow().date)
    created_at = Column("created_at", DateTime, default=datetime.utcnow)
    updated_at = Column("updated_at", DateTime, default=datetime.utcnow)