from sqlalchemy import Column, String, JSON, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base
from datetime import datetime

# Define enums
AI_JOB_TYPE = ('summarize', 'translate', 'image_gen', 'draft')
JOB_STATUS = ('pending', 'running', 'success', 'failed')

class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    node_id = Column(UUID(as_uuid=True), ForeignKey('nodes.id'))
    job_type = Column(Enum(*AI_JOB_TYPE, name='ai_job_type'), nullable=False)
    status = Column(Enum(*JOB_STATUS, name='job_status'), nullable=False)
    request_payload = Column(JSON)
    result_payload = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)