import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Load environment variables from .env file
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
    
    # Create Base class for models
    Base = declarative_base()
else:
    # Database configuration for PostgreSQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "adcluster")  # Fixed: was "nicchals"
    DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
    DB_NAME = os.getenv("DB_NAME", "adcluster_db")

    # Construct database URL
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    # Create SQLAlchemy engine
    engine = create_engine(DATABASE_URL)

    # Enable ltree extension
    @event.listens_for(engine, "connect")
    def set_search_path(dbapi_connection, connection_record):
        with dbapi_connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS ltree")
        dbapi_connection.commit()

    # Create Base class for models
    Base = declarative_base()

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()