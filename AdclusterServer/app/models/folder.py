from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Folder(Base):
    __tablename__ = "folders"

    folderid = Column('folderid', Integer, primary_key=True, autoincrement=True)
    foldername = Column('foldername', String(255), nullable=False)
    folderdescription = Column('folderdescription', Text)
    projectid = Column('projectid', UUID(as_uuid=True), ForeignKey('projects.prjid'), nullable=False)
    creatorid = Column('creatorid', UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    parentfolderid = Column('parentfolderid', Integer, ForeignKey('folders.folderid'))
    foldercreated = Column('foldercreated', TIMESTAMP(timezone=True), default=datetime.utcnow)
    folderupdated = Column('folderupdated', TIMESTAMP(timezone=True), default=datetime.utcnow)
    folderorder = Column('folderorder', Integer, default=0)
    
    # Relationships
    project = relationship("Project", back_populates="folders")
    creator = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[folderid], back_populates="children")
    children = relationship("Folder", back_populates="parent", cascade="all, delete-orphan")