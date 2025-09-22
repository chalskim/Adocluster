import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv("GOOGLE_SCHOLAR_KEY")
print(f"API Key exists: {bool(api_key)}")
print(f"API Key length: {len(api_key) if api_key else 0}")

if not api_key:
    print("Error: API key not found")
    exit(1)

# Test the SERP API
try:
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_scholar",
        "q": "artificial intelligence",
        "api_key": api_key,
        "num": 3
    }
    
    print("Making request to SERP API...")
    response = httpx.get(url, params=params)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total results: {data.get('search_information', {}).get('total_results', 0)}")
        print(f"Organic results count: {len(data.get('organic_results', []))}")
        
        # Print first result title
        if data.get('organic_results'):
            print(f"First result title: {data['organic_results'][0].get('title', 'No title')}")
        else:
            print("No organic results found")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"Error making request: {e}")