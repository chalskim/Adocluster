from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy_utils import LtreeType
import uuid
from app.core.database import Base
from datetime import datetime

# Define enums
NODE_TYPE = ('project_folder', 'folder', 'note', 'external_file', 'external_bookmark', 'ai_generated')

class Node(Base):
    __tablename__ = "nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('nodes.id', ondelete='CASCADE'))
    type = Column(Enum(*NODE_TYPE, name='node_type'), nullable=False)
    title = Column(String(255))
    order = Column(Integer)
    include_in_export = Column(Boolean, default=True)
    node_metadata = Column('metadata', JSON)  # Renamed to avoid conflict with SQLAlchemy reserved keyword
    path = Column(LtreeType)