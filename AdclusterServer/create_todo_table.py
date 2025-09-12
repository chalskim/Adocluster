from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# 데이터베이스 연결 - use PostgreSQL by default
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    # Use SQLite for development
    DATABASE_URL = "sqlite:///./test.db"
else:
    # Database configuration for PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "adcluster")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
    DB_NAME = os.getenv("DB_NAME", "adcluster_db")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if USE_SQLITE else {})
Base = declarative_base()

class SimpleTodo(Base):
    __tablename__ = "simple_todos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String(100), nullable=True)

# 테이블 생성
if __name__ == "__main__":
    try:
        Base.metadata.create_all(engine)
        print("✅ simple_todos 테이블이 성공적으로 생성되었습니다!")
    except Exception as e:
        print(f"❌ 테이블 생성 중 오류 발생: {e}")