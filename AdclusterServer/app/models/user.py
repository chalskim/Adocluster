from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import datetime
import uuid

class User(Base):
    __tablename__ = "users"
    
    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uemail = Column(String, unique=True, index=True)
    uname = Column(String, unique=True, index=True)
    upassword = Column(String)
    uactive = Column(Boolean, default=True)
    urole = Column(String, default='user')
    uisdel = Column(Boolean, default=False)  # Added for soft deletion check
    ucreate_at = Column(DateTime, default=datetime.datetime.utcnow)
    ulast_login = Column(DateTime)
    uupdated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    teams = relationship("Team", secondary="team_members", back_populates="members")
    owned_teams = relationship("Team", back_populates="owner")
    
    def __repr__(self):
        return f"<User(uid={self.uid}, uemail={self.uemail}, uname={self.uname})>"