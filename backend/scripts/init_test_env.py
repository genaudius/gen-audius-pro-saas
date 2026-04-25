"""
Pro Test Setup - Environment Initialization
============================================
Initializes a test user and wallet in the local SQLite DB to support Pro feature testing.
"""
import sys
import os

# Add the current directory to sys.path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, UserWallet, UserAccount, GenerationLog
from main import _hash_password

def init_test_env():
    db = SessionLocal()
    test_user_id = "gen_audius_tester_123"
    
    print(f"Initializing environment for user: {test_user_id}")
    
    # 1. Create User
    existing_user = db.query(UserAccount).filter(UserAccount.user_id == test_user_id).first()
    if not existing_user:
        new_user = UserAccount(
            user_id=test_user_id,
            username="ProTester",
            email="tester@genaudius.com",
            password_hash=_hash_password("testpass123"),
            role="user"
        )
        db.add(new_user)
        print("DONE: UserAccount created.")
    else:
        print("INFO: UserAccount already exists.")
        
    # 2. Create Wallet with Pro credits
    existing_wallet = db.query(UserWallet).filter(UserWallet.user_id == test_user_id).first()
    if not existing_wallet:
        new_wallet = UserWallet(
            user_id=test_user_id,
            credits=50000, # Big amount for stress testing
            balance=1000.0
        )
        db.add(new_wallet)
        print("DONE: UserWallet created with 50,000 credits.")
    else:
        existing_wallet.credits = 50000
        print("DONE: UserWallet updated with 50,000 credits.")
        
    db.commit()
    db.close()
    print("DONE: Environment ready for Stress Test.")

if __name__ == "__main__":
    init_test_env()
