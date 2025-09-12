from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
import uuid
from app.core.database import Base
from datetime import datetime

class MyTodolist(Base):
    __tablename__ = "myTodolist"

    todoID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prjID = Column(UUID(as_uuid=True), ForeignKey('projects.prjID'), nullable=False)
    todoTitle = Column(String(255), nullable=False)
    todoDescription = Column(Text)
    todoStatus = Column(String(50), default='pending')
    todoCreated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    todoUpdated = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    todoCompleted = Column(TIMESTAMP(timezone=True))
    todoOwnerID = Column(UUID(as_uuid=True), ForeignKey('users.uid'), nullable=False)
    todoAssigneeID = Column(UUID(as_uuid=True), ForeignKey('users.uid'))
    todoIsImportant = Column(Boolean, default=False)
    todoIsUrgent = Column(Boolean, default=False)