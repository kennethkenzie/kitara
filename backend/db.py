import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import os
from pathlib import Path
from dotenv import load_dotenv
from contextlib import contextmanager

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'kitara_cinema'),
    'user': os.getenv('DB_USER', 'kitara_user'),
    'password': os.getenv('DB_PASSWORD', 'kitara_password')
}

# Create connection pool
try:
    connection_pool = SimpleConnectionPool(1, 20, **DB_CONFIG)
    if connection_pool:
        print("✅ Database connection pool created successfully")
except Exception as e:
    print(f"❌ Error creating connection pool: {e}")
    connection_pool = None

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    connection = connection_pool.getconn()
    try:
        yield connection
    finally:
        connection_pool.putconn(connection)

@contextmanager
def get_db_cursor(commit=True):
    """Context manager for database cursor with automatic commit/rollback"""
    with get_db_connection() as connection:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()

def execute_query(query, params=None, fetch_one=False, fetch_all=True, commit=True):
    """Execute a query and return results"""
    with get_db_cursor(commit=commit) as cursor:
        cursor.execute(query, params or ())
        
        if fetch_one:
            return cursor.fetchone()
        elif fetch_all:
            return cursor.fetchall()
        else:
            return cursor.rowcount
