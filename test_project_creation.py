import requests
import uuid

# Test project creation
def test_project_creation():
    # Login first to get a token
    login_url = "http://localhost:8000/auth/login"
    login_data = {
        "uemail": "test@example.com",
        "password": "testpassword"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.status_code}")
            print(login_response.text)
            return
            
        token = login_response.json().get("access_token")
        if not token:
            print("No token received")
            return
            
        print(f"Token: {token}")
        
        # Create a project
        project_url = "http://localhost:8000/api/projects/"
        project_data = {
            "title": "Test Project",
            "description": "Test project description",
            "visibility": "team",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31"
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        project_response = requests.post(project_url, json=project_data, headers=headers)
        print(f"Project creation status: {project_response.status_code}")
        print(f"Project response: {project_response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_project_creation()