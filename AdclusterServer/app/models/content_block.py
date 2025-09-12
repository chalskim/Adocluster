from sqlalchemy import Column, String, Integer, JSON, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

# Define enums
CONTENT_BLOCK_TYPE = ('paragraph', 'heading', 'list', 'table', 'image', 'drawing', 'math', 'code', 'embed', 'file_attachment', 'graph')

class ContentBlock(Base):
    __tablename__ = "content_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_id = Column(UUID(as_uuid=True), ForeignKey('nodes.id', ondelete='CASCADE'), nullable=False)
    block_type = Column(Enum(*CONTENT_BLOCK_TYPE, name='content_block_type'), nullable=False)
    content = Column(JSON)
    position = Column(Integer)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)