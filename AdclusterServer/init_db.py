import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uuid
from datetime import datetime

load_dotenv()

# Check if we should use SQLite for development
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    # Use SQLite for development
    DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Custom UUID type for SQLite
    from sqlalchemy import TypeDecorator, CHAR
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    
    class UUID(TypeDecorator):
        """Platform-independent GUID type.
        
        Uses PostgreSQL's UUID type, otherwise uses CHAR(32) storing as stringified hex values.
        """
        impl = CHAR
        cache_ok = True

        def load_dialect_impl(self, dialect):
            if dialect.name == 'postgresql':
                return dialect.type_descriptor(PG_UUID())
            else:
                return dialect.type_descriptor(CHAR(32))

        def process_bind_param(self, value, dialect):
            if value is None:
                return value
            elif dialect.name == 'postgresql':
                return str(value)
            else:
                if not isinstance(value, uuid.UUID):
                    return "%.32x" % uuid.UUID(value).int
                else:
                    # hexstring
                    return "%.32x" % value.int

        def process_result_value(self, value, dialect):
            if value is None:
                return value
            else:
                if not isinstance(value, uuid.UUID):
                    value = uuid.UUID(value)
                return value
else:
    # Database configuration for PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "adcluster")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
    DB_NAME = os.getenv("DB_NAME", "adcluster_db")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(DATABASE_URL)

Base = declarative_base()

# Simple User model that matches the actual application model
class User(Base):
    __tablename__ = "users"
    
    uid = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    uemail = Column(String, unique=True, index=True)
    uname = Column(String, unique=True, index=True)  # This column is missing
    upassword = Column(String)
    uactive = Column(Boolean, default=True)
    urole = Column(String, default='user')
    uisdel = Column(Boolean, default=False)  # This column is missing
    ucreate_at = Column(DateTime, default=datetime.utcnow)
    uupdated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Simple Todo model
class SimpleTodo(Base):
    __tablename__ = "simple_todos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    text = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(String(100), nullable=True)

# Create tables
if __name__ == "__main__":
    try:
        print("Creating database tables...")
        Base.metadata.create_all(engine)
        print("✅ All tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")