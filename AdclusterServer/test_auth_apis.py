import requests
import json
import time

# Server base URL
BASE_URL = "http://localhost:8000"

def test_registration():
    """Test user registration API"""
    print("Testing User Registration...")
    
    # Registration data with unique email
    timestamp = int(time.time())
    register_data = {
        "uemail": f"test_{timestamp}@example.com",
        "upassword": "testpassword123",
        "urole": "user",
        "uavatar": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers={"Content-Type": "application/json"},
            data=json.dumps(register_data)
        )
        
        print(f"Registration Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Registration Response: {response.json()}")
            print("✅ Registration successful!")
            return response.json()
        else:
            print(f"Registration Response: {response.text}")
            print("❌ Registration failed!")
            return None
            
    except Exception as e:
        print(f"Error during registration: {e}")
        return None

def test_login(email=None):
    """Test user login API"""
    print("\nTesting User Login...")
    
    # Login data
    login_data = {
        "uemail": email or f"test_{int(time.time())}@example.com",
        "upassword": "testpassword123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(login_data)
        )
        
        print(f"Login Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Login Response: {response.json()}")
            print("✅ Login successful!")
            return response.json()
        else:
            print(f"Login Response: {response.text}")
            print("❌ Login failed!")
            return None
            
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_protected_endpoint(token):
    """Test accessing a protected endpoint with the token"""
    print("\nTesting Protected Endpoint Access...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"Protected Endpoint Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Protected Endpoint Response: {response.json()}")
            print("✅ Protected endpoint access successful!")
        else:
            print(f"Protected Endpoint Response: {response.text}")
            print("❌ Protected endpoint access failed!")
            
    except Exception as e:
        print(f"Error accessing protected endpoint: {e}")

def test_duplicate_registration():
    """Test registering with an existing email"""
    print("\nTesting Duplicate Registration...")
    
    # Try to register with the same email again
    register_data = {
        "uemail": "test@example.com",
        "upassword": "anotherpassword",
        "urole": "user",
        "uavatar": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers={"Content-Type": "application/json"},
            data=json.dumps(register_data)
        )
        
        print(f"Duplicate Registration Status Code: {response.status_code}")
        if response.status_code == 400:
            print("✅ Duplicate registration correctly rejected!")
            return True
        else:
            print(f"Unexpected response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error during duplicate registration test: {e}")
        return False

if __name__ == "__main__":
    print("Starting Authentication API Tests...\n")
    
    # Test registration
    registration_result = test_registration()
    
    if registration_result:
        # Test login with the newly registered user
        login_result = test_login(registration_result["uemail"])
        
        # If login was successful, test protected endpoint
        if login_result and "access_token" in login_result:
            test_protected_endpoint(login_result["access_token"])
    
    # Test duplicate registration
    test_duplicate_registration()
    
    print("\nAuthentication API Tests Completed.")