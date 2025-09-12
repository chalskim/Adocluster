import requests
import json
from datetime import date
import uuid

# Test project creation
def test_project_creation():
    # Register a new user first
    register_url = "http://localhost:8000/auth/register"
    unique_id = str(uuid.uuid4())[:8]  # Generate unique identifier
    register_data = {
        "uemail": f"testuser_{unique_id}@example.com",
        "uname": f"testuser_{unique_id}",
        "password": "testpassword123"
    }
    
    try:
        # Register new user
        register_response = requests.post(register_url, json=register_data)
        print(f"Register Status Code: {register_response.status_code}")
        print(f"Register Response: {register_response.json()}")
        
        if register_response.status_code != 201:
            print("Registration failed")
            return
        
        # Extract user data
        user_data = register_response.json()
        print(f"User created: {user_data}")
        
        # Login with the new user
        login_url = "http://localhost:8000/auth/login"
        login_data = {
            "uemail": f"testuser_{unique_id}@example.com",
            "password": "testpassword123"
        }
        
        # Login
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status Code: {login_response.status_code}")
        print(f"Login Response: {login_response.json()}")
        
        if login_response.status_code != 200:
            print("Login failed")
            return
        
        # Extract token
        token = login_response.json().get("access_token")
        if not token:
            print("No token received")
            return
            
        print(f"Token: {token}")
        
        # API endpoint for project creation
        url = "http://localhost:8000/api/projects/"
        
        # Sample project data
        project_data = {
            "title": "Test Project",
            "description": "This is a test project",
            "visibility": "team",
            "start_date": str(date.today()),
            "end_date": None
        }
        
        # Headers with auth token
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # Send POST request to create project
        response = requests.post(url, headers=headers, data=json.dumps(project_data))
        
        # Print response
        print(f"Project Creation Status Code: {response.status_code}")
        if response.status_code == 201:
            print(f"Project created successfully: {response.json()}")
        else:
            print(f"Project creation failed: {response.text}")
        
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_project_creation()