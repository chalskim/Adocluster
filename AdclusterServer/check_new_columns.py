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
    
    # Check new lib columns in mylib table
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'mylib' AND column_name LIKE 'lib%';")
    print('New lib columns in mylib:')
    for row in cursor.fetchall():
        print(f'  {row[0]}')
    
    # Check new item columns in mylibitems table
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'mylibitems' AND column_name LIKE 'item%';")
    print('\nNew item columns in mylibitems:')
    for row in cursor.fetchall():
        print(f'  {row[0]}')
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()