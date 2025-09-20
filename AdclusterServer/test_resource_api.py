import requests
import json

# Test the resource management API
BASE_URL = "http://localhost:8000"
TOKEN = "your_jwt_token_here"  # Replace with a valid JWT token

def test_resource_api():
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test creating a resource
    resource_data = {
        "itemType": "image",
        "itemTitle": "샘플 이미지",
        "itemAuthor": "홍길동",
        "itemPublisher": "샘플 출판사",
        "itemYear": "2023",
        "itemURL": "https://example.com/image.jpg",
        "itemDOI": "10.1234/sample.doi",
        "itemKeywords": "샘플, 이미지, 예제",
        "itemAbstract": "샘플 이미지 자료입니다."
    }
    
    print("Creating a new resource...")
    response = requests.post(f"{BASE_URL}/api/resources", headers=headers, json=resource_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test getting all resources
    print("\nGetting all resources...")
    response = requests.get(f"{BASE_URL}/api/resources", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Number of resources: {len(response.json())}")
    
    # Test getting a specific resource (if any exist)
    resources = response.json()
    if resources:
        resource_id = resources[0]["itemID"]
        print(f"\nGetting resource with ID: {resource_id}")
        response = requests.get(f"{BASE_URL}/api/resources/{resource_id}", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Resource: {response.json()}")

if __name__ == "__main__":
    test_resource_api()