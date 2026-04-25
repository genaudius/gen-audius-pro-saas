from backend.database import engine
from sqlalchemy import text

def fix_schema():
    print("Checking schema...")
    with engine.connect() as con:
        try:
            con.execute(text("ALTER TABLE user_accounts ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            con.commit()
            print("Successfully added is_verified column.")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column is_verified already exists.")
            else:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    fix_schema()
