import asyncio
import websockets
import requests
import time

async def test_client_messaging():
    # Connect two clients
    uri1 = "ws://localhost:8000/ws/101"
    uri2 = "ws://localhost:8000/ws/102"
    
    async with websockets.connect(uri1) as client1:
        # Receive welcome message for client 1
        welcome1 = await client1.recv()
        print(f"Client 101 received: {welcome1}")
        
        async with websockets.connect(uri2) as client2:
            # Receive welcome message for client 2
            welcome2 = await client2.recv()
            print(f"Client 102 received: {welcome2}")
            
            # Check connected clients via HTTP
            response = requests.get("http://localhost:8000/ws/clients")
            if response.status_code == 200:
                data = response.json()
                print(f"Connected clients: {data}")
            
            # Test 1: Send message from client 101 to client 102 using WebSocket command
            print("\n--- Test 1: WebSocket command to send message ---")
            await client1.send("/send_to 102 Hello from client 101!")
            
            # Client 101 should receive confirmation
            confirmation = await client1.recv()
            print(f"Client 101 received: {confirmation}")
            
            # Client 102 should receive the private message
            private_message = await client2.recv()
            print(f"Client 102 received: {private_message}")
            
            # Test 2: Send message from server to client 101 using HTTP endpoint
            print("\n--- Test 2: HTTP endpoint to send message ---")
            response = requests.post(
                "http://localhost:8000/ws/send_to/101",
                json={"message": "Hello from server!"}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"HTTP response: {data}")
            
            # Client 101 should receive the message
            server_message = await client1.recv()
            print(f"Client 101 received: {server_message}")

if __name__ == "__main__":
    asyncio.run(test_client_messaging())