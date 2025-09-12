import asyncio
import websockets
import requests
import time

async def test_specific_client_messaging():
    # Connect multiple clients
    clients = {}
    
    # Connect first client
    uri1 = "ws://localhost:8000/ws/101"
    try:
        client1 = await websockets.connect(uri1)
        clients[101] = client1
        print("Client 101 connected")
        
        # Receive welcome message
        welcome = await client1.recv()
        print(f"Client 101 received: {welcome}")
    except Exception as e:
        print(f"Error connecting client 101: {e}")
        return

    # Connect second client
    uri2 = "ws://localhost:8000/ws/102"
    try:
        client2 = await websockets.connect(uri2)
        clients[102] = client2
        print("Client 102 connected")
        
        # Receive welcome message
        welcome = await client2.recv()
        print(f"Client 102 received: {welcome}")
    except Exception as e:
        print(f"Error connecting client 102: {e}")
        return

    # Connect third client
    uri3 = "ws://localhost:8000/ws/103"
    try:
        client3 = await websockets.connect(uri3)
        clients[103] = client3
        print("Client 103 connected")
        
        # Receive welcome message
        welcome = await client3.recv()
        print(f"Client 103 received: {welcome}")
    except Exception as e:
        print(f"Error connecting client 103: {e}")
        return

    # Wait a moment for the client list to update
    await asyncio.sleep(1)
    
    # Check the client list via HTTP endpoint
    try:
        response = requests.get("http://localhost:8000/ws/clients")
        if response.status_code == 200:
            data = response.json()
            print(f"Connected clients: {data}")
        else:
            print(f"Failed to get client list: {response.status_code}")
    except Exception as e:
        print(f"Error fetching client list: {e}")

    # Test 1: Send message from client 101 to client 102 using WebSocket command
    print("\n--- Test 1: WebSocket command to send message ---")
    try:
        # Send command from client 101 to client 102
        await client1.send("/send_to 102 Hello from client 101!")
        
        # Give time for message processing
        await asyncio.sleep(0.5)
        
        # Client 101 should receive confirmation
        confirmation = await client1.recv()
        print(f"Client 101 received: {confirmation}")
        
        # Client 102 should receive the private message
        private_message = await client2.recv()
        print(f"Client 102 received: {private_message}")
    except Exception as e:
        print(f"Error in Test 1: {e}")

    # Test 2: Send message from server to client 103 using HTTP endpoint
    print("\n--- Test 2: HTTP endpoint to send message ---")
    try:
        # Send message via HTTP endpoint
        response = requests.post(
            "http://localhost:8000/ws/send_to/103",
            json={"message": "Hello from server via HTTP!"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"HTTP response: {data}")
        else:
            print(f"Failed to send message via HTTP: {response.status_code}")
            
        # Give time for message processing
        await asyncio.sleep(0.5)
        
        # Client 103 should receive the message
        server_message = await client3.recv()
        print(f"Client 103 received: {server_message}")
    except Exception as e:
        print(f"Error in Test 2: {e}")

    # Test 3: Try to send message to non-existent client
    print("\n--- Test 3: Send message to non-existent client ---")
    try:
        # Send command from client 101 to non-existent client 999
        await client1.send("/send_to 999 This should fail")
        
        # Give time for message processing
        await asyncio.sleep(0.5)
        
        # Client 101 should receive error message
        error_message = await client1.recv()
        print(f"Client 101 received: {error_message}")
    except Exception as e:
        print(f"Error in Test 3: {e}")

    # Close all connections
    for client_id, client in clients.items():
        await client.close()
    
    print("\nAll clients disconnected")

if __name__ == "__main__":
    asyncio.run(test_specific_client_messaging())