from app.core.database import get_db
from sqlalchemy import text
import time

def test_db_connection():
    print("Testing DB connection...")
    try:
        db = next(get_db())
        # Run a simple query
        result = db.execute(text("SELECT 1")).scalar()
        print(f"Query result: {result}")
        print("Initial connection successful.")
        
        print("Waiting 5 seconds to test persistence...")
        time.sleep(5)
        
        result = db.execute(text("SELECT 1")).scalar()
        print(f"Query result: {result}")
        print("Persistent connection successful.")
        
    except Exception as e:
        print(f"DB Connection failed: {e}")

if __name__ == "__main__":
    test_db_connection()
