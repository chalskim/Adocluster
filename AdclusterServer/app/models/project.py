from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

# Define enums
PROJECT_VISIBILITY = ('private', 'team', 'public')

class Project(Base):
    __tablename__ = "projects"

    prjid = Column('prjid', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crtid = Column('crtid', UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    title = Column('title', String(200), nullable=False)
    description = Column('description', Text)
    protag = Column('protag', Text)
    prokey = Column('prokey', Text)
    visibility = Column('visibility', String(50), nullable=False, default='team')
    status = Column('status', String(50))
    start_date = Column('start_date', Date)
    end_date = Column('end_date', Date)
    created_at = Column('created_at', TIMESTAMP(timezone=True), default=datetime.utcnow)
    update_at = Column('update_at', TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    folders = relationship("Folder", back_populates="project", cascade="all, delete-orphan")