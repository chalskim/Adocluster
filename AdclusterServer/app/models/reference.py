from sqlalchemy import Column, String, JSON, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

# Define enums
REFERENCE_TYPE = ('bibtex', 'doi', 'crossref')

class ProjectReference(Base):
    __tablename__ = "project_references"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    type = Column(Enum(*REFERENCE_TYPE, name='reference_type'), nullable=False)
    raw_data = Column(JSON)
    formatted_text = Column(Text)