import asyncio
import websockets
import requests
import time

async def test_detailed():
    print("Starting detailed test...")
    
    # Connect first client
    uri1 = "ws://localhost:8000/ws/101"
    print("Connecting client 101...")
    client1 = await websockets.connect(uri1)
    
    # Receive welcome message for client 1
    welcome1 = await client1.recv()
    print(f"Client 101 received: {welcome1}")
    
    # Connect second client
    uri2 = "ws://localhost:8000/ws/102"
    print("Connecting client 102...")
    client2 = await websockets.connect(uri2)
    
    # Receive welcome message for client 2
    welcome2 = await client2.recv()
    print(f"Client 102 received: {welcome2}")
    
    # Wait a bit for client list updates
    await asyncio.sleep(1)
    
    # Check connected clients via HTTP
    print("Checking connected clients via HTTP...")
    response = requests.get("http://localhost:8000/ws/clients")
    if response.status_code == 200:
        data = response.json()
        print(f"Connected clients: {data}")
    
    # Test 1: Send message from client 101 to client 102 using WebSocket command
    print("\n--- Test 1: WebSocket command to send message ---")
    await client1.send("/send_to 102 Hello from client 101!")
    print("Sent command to client 102")
    
    # Wait for processing
    await asyncio.sleep(1)
    
    # Check what client 101 received
    try:
        msg1 = await asyncio.wait_for(client1.recv(), timeout=2.0)
        print(f"Client 101 received: {msg1}")
    except asyncio.TimeoutError:
        print("Client 101 received no message (timeout)")
    
    # Check what client 102 received
    try:
        msg2 = await asyncio.wait_for(client2.recv(), timeout=2.0)
        print(f"Client 102 received: {msg2}")
    except asyncio.TimeoutError:
        print("Client 102 received no message (timeout)")
    
    # Test 2: Send message from server to client 101 using HTTP endpoint
    print("\n--- Test 2: HTTP endpoint to send message ---")
    response = requests.post(
        "http://localhost:8000/ws/send_to/101",
        json={"message": "Hello from server!"}
    )
    if response.status_code == 200:
        data = response.json()
        print(f"HTTP response: {data}")
    
    # Wait for processing
    await asyncio.sleep(1)
    
    # Check what client 101 received
    try:
        msg3 = await asyncio.wait_for(client1.recv(), timeout=2.0)
        print(f"Client 101 received: {msg3}")
    except asyncio.TimeoutError:
        print("Client 101 received no message (timeout)")
    
    # Close connections
    await client1.close()
    await client2.close()
    print("\nTest completed.")

if __name__ == "__main__":
    asyncio.run(test_detailed())