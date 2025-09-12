from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class ClientIP(Base):
    __tablename__ = "client_ips"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), unique=True, index=True)  # IPv6 대비 45자
    user_agent = Column(Text)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    access_count = Column(Integer, default=1)
    country = Column(String(100))
    city = Column(String(100))
    
    def to_dict(self):
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "first_seen": self.first_seen.isoformat() if self.first_seen else None,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "access_count": self.access_count,
            "country": self.country,
            "city": self.city
        }