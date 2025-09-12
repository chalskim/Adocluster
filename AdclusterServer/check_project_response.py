import requests
import json
from datetime import date
import uuid

# Test project creation and check response format
def test_project_response():
    # Register a new user first
    register_url = "http://localhost:8000/auth/register"
    unique_id = str(uuid.uuid4())[:8]  # Generate unique identifier
    register_data = {
        "uemail": f"debuguser_{unique_id}@example.com",
        "uname": f"debuguser_{unique_id}",
        "password": "testpassword123"
    }
    
    try:
        # Register new user
        register_response = requests.post(register_url, json=register_data)
        print(f"Register Status Code: {register_response.status_code}")
        
        if register_response.status_code != 201:
            print("Registration failed")
            return
        
        # Login with the new user
        login_url = "http://localhost:8000/auth/login"
        login_data = {
            "uemail": f"debuguser_{unique_id}@example.com",
            "password": "testpassword123"
        }
        
        # Login
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status Code: {login_response.status_code}")
        
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
            "title": "Test Project for Debugging",
            "description": "This is a test project to check the response format",
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
        print(f"Response Headers: {response.headers}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 201:
            response_json = response.json()
            print(f"Project created successfully:")
            print(f"  Full response: {json.dumps(response_json, indent=2, ensure_ascii=False)}")
            print(f"  prjID field exists: {'prjID' in response_json}")
            print(f"  prjid field exists: {'prjid' in response_json}")
            if 'prjID' in response_json:
                print(f"  prjID value: {response_json['prjID']}")
            if 'prjid' in response_json:
                print(f"  prjid value: {response_json['prjid']}")
        else:
            print(f"Project creation failed: {response.text}")
        
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_project_response()