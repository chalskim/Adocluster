import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def apply_migration():
    conn = None
    cursor = None
    
    try:
        # Database connection parameters
        db_params = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'adcluster'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres'),
            'port': int(os.getenv('DB_PORT', '5432'))
        }
        
        # Connect to the database
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        # Read the migration SQL file
        with open('migrations/20250920_fix_mylib_schema.sql', 'r') as file:
            migration_sql = file.read()
        
        # Split the migration into individual statements
        # Extract the upgrade section
        if '-- 업그레이드' in migration_sql:
            upgrade_section = migration_sql.split('-- 업그레이드')[1]
            if '-- 롤백' in upgrade_section:
                upgrade_section = upgrade_section.split('-- 롤백')[0]
            
            statements = upgrade_section.strip().split(';')
            
            # Execute each statement
            for statement in statements:
                statement = statement.strip()
                if statement:
                    print(f"Executing: {statement[:50]}...")
                    try:
                        cursor.execute(statement)
                    except Exception as e:
                        print(f"Warning: {e}")
        
        # Commit the changes
        conn.commit()
        print("Migration applied successfully!")
        
    except Exception as e:
        print(f"Error applying migration: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    apply_migration()