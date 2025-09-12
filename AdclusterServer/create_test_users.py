#!/usr/bin/env python3
"""
Script to create 10 test users with the password 'a770405z'
"""

import sys
import os
import uuid
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql

# Add the app directory to the path so we can import from our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.security import get_password_hash

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'adcluster_db'),
            user=os.getenv('DB_USER', 'adcluster'),
            password=os.getenv('DB_PASSWORD', 'a770405z')
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def create_test_users():
    """Create 10 test users with the password 'a770405z'"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Hash the password
    password = "a770405z"
    hashed_password = get_password_hash(password)
    
    # Create 10 test users
    test_users = []
    for i in range(1, 11):
        user_data = {
            'uid': str(uuid.uuid4()),
            'uemail': f'testuser{i}@example.com',
            'uname': f'testuser{i}',
            'upassword': hashed_password,
            'uactive': True,
            'urole': 'user',
            'uisdel': False
        }
        test_users.append(user_data)
    
    try:
        # Insert users into the database
        for user in test_users:
            insert_query = """
                INSERT INTO users (uid, uemail, uname, upassword, uactive, urole, uisdel, ucreate_at, uupdated_at)
                VALUES (%(uid)s, %(uemail)s, %(uname)s, %(upassword)s, %(uactive)s, %(urole)s, %(uisdel)s, NOW(), NOW())
            """
            cursor.execute(insert_query, user)
            print(f"Created user: {user['uemail']} with username: {user['uname']}")
        
        # Commit changes
        conn.commit()
        print(f"\nSuccessfully created {len(test_users)} test users!")
        
    except Exception as e:
        print(f"Error creating test users: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_test_users()