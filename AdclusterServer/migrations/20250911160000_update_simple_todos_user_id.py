"""
Migration script to make user_id column non-nullable in simple_todos table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.database import DATABASE_URL

def upgrade():
    engine = create_engine(DATABASE_URL)
    with engine.begin() as conn:  # Use begin() for automatic transaction handling
        # First, delete any rows with NULL user_id
        result = conn.execute(text("DELETE FROM simple_todos WHERE user_id IS NULL"))
        deleted_rows = result.rowcount
        print(f"Deleted {deleted_rows} rows with NULL user_id")
        
        # Then make the column non-nullable
        conn.execute(text("ALTER TABLE simple_todos ALTER COLUMN user_id SET NOT NULL"))
        
    print("✅ Successfully updated simple_todos table: user_id column is now non-nullable")

def downgrade():
    engine = create_engine(DATABASE_URL)
    with engine.begin() as conn:  # Use begin() for automatic transaction handling
        # Make the column nullable again
        conn.execute(text("ALTER TABLE simple_todos ALTER COLUMN user_id DROP NOT NULL"))
        
    print("✅ Successfully downgraded simple_todos table: user_id column is now nullable")

if __name__ == "__main__":
    upgrade()