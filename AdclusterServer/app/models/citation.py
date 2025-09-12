from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Citation(Base):
    __tablename__ = "citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_block_id = Column(UUID(as_uuid=True), ForeignKey('content_blocks.id', ondelete='CASCADE'), nullable=False)
    reference_id = Column(UUID(as_uuid=True), ForeignKey('project_references.id', ondelete='RESTRICT'), nullable=False)