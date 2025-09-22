import sys
import os
sys.path.append('.')

# Set up Django-like environment
os.environ.setdefault('ENV_FILE', '.env')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.jwt import create_access_token
from datetime import timedelta
from app.core.config import settings
import httpx
import asyncio

async def test_google_scholar():
    # Get a user from the database
    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    
    if not user:
        print("No users found in database")
        return
    
    print(f"Testing with user: {user.uname} ({user.uemail})")
    
    # Create a valid token for this user
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.uname, "uemail": user.uemail, "user_id": str(user.uid)},
        expires_delta=access_token_expires
    )
    
    print(f"Generated token: {access_token}")
    
    # Test the Google Scholar endpoint
    url = "http://localhost:8000/api/google-scholar/search"
    params = {
        "query": "artificial intelligence",
        "limit": 3
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    print("Making request to Google Scholar endpoint...")
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
    
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Got {len(data.get('results', []))} results")
        if data.get('results'):
            print(f"First result: {data['results'][0].get('title', 'No title')}")
    else:
        print(f"Error: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error details: {error_data}")
        except:
            print(f"Error text: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_google_scholar())