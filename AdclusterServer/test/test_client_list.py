import asyncio
import websockets
import requests
import time

async def test_client_list():
    # Connect multiple clients
    clients = []
    
    # Connect first client
    uri1 = "ws://localhost:8000/ws/101"
    try:
        client1 = await websockets.connect(uri1)
        clients.append(client1)
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
        clients.append(client2)
        print("Client 102 connected")
        
        # Receive welcome message
        welcome = await client2.recv()
        print(f"Client 102 received: {welcome}")
    except Exception as e:
        print(f"Error connecting client 102: {e}")
        return

    # Connect anonymous client
    uri3 = "ws://localhost:8000/ws"
    try:
        client3 = await websockets.connect(uri3)
        clients.append(client3)
        print("Anonymous client connected")
        
        # Receive welcome message
        welcome = await client3.recv()
        print(f"Anonymous client received: {welcome}")
    except Exception as e:
        print(f"Error connecting anonymous client: {e}")
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

    # Close all connections
    for client in clients:
        await client.close()
    
    print("All clients disconnected")
    
    # Check client list again after disconnection
    await asyncio.sleep(1)
    try:
        response = requests.get("http://localhost:8000/ws/clients")
        if response.status_code == 200:
            data = response.json()
            print(f"Connected clients after disconnection: {data}")
        else:
            print(f"Failed to get client list: {response.status_code}")
    except Exception as e:
        print(f"Error fetching client list: {e}")

if __name__ == "__main__":
    asyncio.run(test_client_list())