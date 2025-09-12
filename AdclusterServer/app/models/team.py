from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

# Define enums
TEAM_ROLE = ('owner', 'admin', 'member')
PERMISSION_ROLE = ('admin', 'editor', 'reviewer', 'reader')

class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey('users.uid'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    members = relationship("User", secondary="team_members", back_populates="teams")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_teams")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.uid', ondelete='CASCADE'), nullable=False)
    role = Column(String(50), nullable=False)  # Using String instead of Enum for flexibility
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('team_id', 'user_id'),)

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey('users.uid', ondelete='CASCADE'))
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id', ondelete='CASCADE'))
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    role = Column(String(50), nullable=False)  # Using String instead of Enum for flexibility
    created_at = Column(DateTime, default=datetime.utcnow)

class Export(Base):
    __tablename__ = "exports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.prjID', ondelete='CASCADE'), nullable=False)
    export_type = Column(String(50), nullable=False)  # Using String instead of Enum for flexibility
    status = Column(String(50), nullable=False)  # Using String instead of Enum for flexibility
    artifact_key = Column(String(1024))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)