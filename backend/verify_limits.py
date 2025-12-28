import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

# You might need to adjust these credentials or use an existing user
EMAIL = "test@example.com"
PASSWORD = "password123"

def login():
    session = requests.Session()
    response = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if response.status_code != 200:
        # Try registering if login fails
        print("Login failed, trying to register...")
        response = session.post(f"{BASE_URL}/auth/register", json={
            "email": EMAIL, 
            "password": PASSWORD,
            "username": "testuser",
            "full_name": "Test User"
        })
        if response.status_code == 200:
            print("Registration successful, logging in...")
            response = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        else:
            print(f"Registration failed: {response.text}")
            sys.exit(1)
            
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        sys.exit(1)
        
    print("Login successful")
    return session

def verify_limits():
    session = login()
    
    # Check current usage
    response = session.get(f"{BASE_URL}/notes/limits/usage")
    if response.status_code != 200:
        print(f"Failed to get usage: {response.text}")
        return
        
    usage = response.json()
    print(f"Current Usage: {usage}")
    
    # Note Limit Test
    # We can't easily create notes without a valid YouTube URL and API key, 
    # but we can check if the endpoint returns 403 if we manually insert notes into DB 
    # or if we just rely on the unit test logic.
    # For this script, let's just print the limits and confirm the endpoint works.
    
    print(f"Max Notes: {usage['max_notes']}")
    print(f"Daily Token Limit: {usage['daily_token_limit']}")
    
    if usage['max_notes'] != 4:
        print("FAIL: Max notes should be 4")
    else:
        print("PASS: Max notes is 4")
        
    if usage['daily_token_limit'] != 1000:
        print("FAIL: Daily token limit should be 1000")
    else:
        print("PASS: Daily token limit is 1000")

if __name__ == "__main__":
    verify_limits()
