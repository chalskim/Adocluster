#!/usr/bin/env python3
"""
Script to apply the client_ips table migration to the database
"""

import os
import sys

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def apply_migration():
    """Apply the client_ips table migration"""
    
    try:
        # Import the database module from the app
        from app.core.database import engine
        from sqlalchemy import text
        
        # Read migration file
        migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '20250915_create_client_ips_table.sql')
        
        if not os.path.exists(migration_file):
            print(f"Migration file not found: {migration_file}")
            return False
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        # Extract the upgrade part (everything before -- Rollback)
        upgrade_sql = migration_sql.split('-- Rollback')[0]
        
        # Execute the migration
        # Execute each statement separately
        statements = [s.strip() for s in upgrade_sql.split(';') if s.strip()]
        with engine.connect() as connection:
            for statement in statements:
                if statement:  # Skip empty statements
                    print(f"Executing: {statement[:50]}...")
                    connection.execute(text(statement))
            connection.commit()
        print("Migration applied successfully!")
        return True
    except Exception as e:
        print(f"Error applying migration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = apply_migration()
    if success:
        print("Client IPs table created successfully!")
    else:
        print("Failed to create client IPs table!")
        sys.exit(1)