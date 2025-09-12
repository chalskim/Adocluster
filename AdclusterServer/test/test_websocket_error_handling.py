import asyncio
import websockets
import json

async def test_valid_client_id():
    uri = "ws://localhost:8000/ws/123"
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected to WebSocket endpoint with valid integer client ID")
            
            # Send a test message
            await websocket.send("Hello WebSocket with valid ID!")
            print("✓ Sent: Hello WebSocket with valid ID!")
            
            # Receive personal response
            response = await websocket.recv()
            print(f"✓ Personal response: {response}")
            
            # Receive broadcast response
            response = await websocket.recv()
            print(f"✓ Broadcast response: {response}")
            
    except Exception as e:
        print(f"✗ Error with valid client ID: {e}")

async def test_invalid_client_id():
    uri = "ws://localhost:8000/ws/abc"
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected to WebSocket endpoint with invalid (non-integer) client ID")
            
            # Try to send a message
            await websocket.send("Hello WebSocket with invalid ID!")
            print("✓ Sent: Hello WebSocket with invalid ID!")
            
            # Try to receive a response
            response = await websocket.recv()
            print(f"✗ Unexpected response: {response}")
            
    except websockets.exceptions.ConnectionClosed as e:
        print(f"✓ Connection properly closed with code {e.code}")
    except Exception as e:
        print(f"✗ Unexpected error with invalid client ID: {e}")

async def test_basic_websocket():
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ Connected to basic WebSocket endpoint")
            
            # Send a test message
            await websocket.send("Hello Basic WebSocket!")
            print("✓ Sent: Hello Basic WebSocket!")
            
            # Receive response
            response = await websocket.recv()
            print(f"✓ Response: {response}")
            
    except Exception as e:
        print(f"✗ Error with basic WebSocket: {e}")

async def main():
    print("Testing WebSocket error handling...")
    print("=" * 50)
    
    await test_basic_websocket()
    print("\n" + "=" * 50 + "\n")
    
    await test_valid_client_id()
    print("\n" + "=" * 50 + "\n")
    
    await test_invalid_client_id()

if __name__ == "__main__":
    asyncio.run(main())