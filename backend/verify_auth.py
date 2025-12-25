import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"
EMAIL = "test_auth_user@example.com"
PASSWORD = "password123"
USERNAME = "test_auth_user"

def test_auth_flow():
    session = requests.Session()
    
    # 1. Register (ignore if exists)
    print("1. Registering user...")
    try:
        response = session.post(f"{BASE_URL}/auth/register", json={
            "email": EMAIL,
            "password": PASSWORD,
            "username": USERNAME
        })
        if response.status_code == 201:
            print("   User registered.")
        elif response.status_code == 400: # Likely already exists
            print("   User likely already exists (400).")
        else:
            print(f"   Registration failed: {response.status_code} {response.text}")
    except Exception as e:
        print(f"   Registration error: {e}")

    # 2. Login
    print("\n2. Logging in...")
    response = session.post(f"{BASE_URL}/auth/login", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    
    if response.status_code != 200:
        print(f"   Login failed: {response.status_code} {response.text}")
        return
    
    print("   Login successful.")
    
    # Check cookies
    cookies = session.cookies.get_dict()
    if "access_token" in cookies and "refresh_token" in cookies:
        print("   SUCCESS: Cookies found: access_token, refresh_token")
    else:
        print(f"   FAILURE: Cookies missing. Found: {cookies.keys()}")
        return

    # 3. Access Protected Route (/me)
    print("\n3. Accessing /me with cookies...")
    response = session.get(f"{BASE_URL}/auth/me")
    if response.status_code == 200:
        print(f"   SUCCESS: Accessed /me. User: {response.json()['email']}")
    else:
        print(f"   FAILURE: Could not access /me. Status: {response.status_code}")
        return

    # 4. Refresh Token
    print("\n4. Refreshing token...")
    # Wait a second to ensure exp time is different (optional, but good for testing rotation if we checked content)
    response = session.post(f"{BASE_URL}/auth/refresh-token")
    if response.status_code == 200:
        print("   SUCCESS: Token refreshed.")
        # Check if cookies updated (hard to check exact value change without decoding, but we can check presence)
        new_cookies = session.cookies.get_dict()
        if "access_token" in new_cookies:
             print("   New access token cookie present.")
    else:
        print(f"   FAILURE: Refresh failed. Status: {response.status_code} {response.text}")
        return

    # 5. Logout
    print("\n5. Logging out...")
    response = session.post(f"{BASE_URL}/auth/logout")
    if response.status_code == 200:
        print("   Logout successful.")
        # Check cookies cleared (requests session might still hold them if not explicitly cleared by server headers correctly, 
        # but server sends Set-Cookie with max-age=0 or expires in past)
        # We can check by trying to access /me again
    else:
        print(f"   Logout failed: {response.status_code}")

    # 6. Verify Access Denied
    print("\n6. Verifying access denied after logout...")
    response = session.get(f"{BASE_URL}/auth/me")
    if response.status_code == 401:
        print("   SUCCESS: Access denied as expected.")
    else:
        print(f"   FAILURE: Access NOT denied. Status: {response.status_code}")

if __name__ == "__main__":
    test_auth_flow()
