import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
db_params = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'adcluster'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': int(os.getenv('DB_PORT', '5432'))
}

conn = None
cursor = None

try:
    # Connect to the database
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    # Check mylib table columns
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mylib' ORDER BY ordinal_position;")
    print('mylib table columns:')
    for row in cursor.fetchall():
        print(f'  {row[0]}: {row[1]}')
    
    # Check mylibitems table columns
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mylibitems' ORDER BY ordinal_position;")
    print('\nmylibitems table columns:')
    for row in cursor.fetchall():
        print(f'  {row[0]}: {row[1]}')
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()