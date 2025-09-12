import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.models.user import User
from app.core.security import get_password_hash
import uuid

def create_test_user():
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.uemail == "test@example.com").first()
        if existing_user:
            print("Test user already exists")
            print(f"User ID: {existing_user.uid}")
            return existing_user.uid
        
        # Create new test user
        new_user = User(
            uid=uuid.uuid4(),
            uemail="test@example.com",
            uname="testuser",
            upassword=get_password_hash("testpassword123")
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("Test user created successfully")
        print(f"User ID: {new_user.uid}")
        return new_user.uid
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()