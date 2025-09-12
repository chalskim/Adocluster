import asyncio
import websockets
import json

async def test_websocket_basic():
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to basic WebSocket endpoint")
            
            # Send a test message
            await websocket.send("Hello WebSocket!")
            print("Sent: Hello WebSocket!")
            
            # Receive response
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # Send another message
            await websocket.send("Second message")
            print("Sent: Second message")
            
            # Receive response
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # Send a third message
            await websocket.send("Third message")
            print("Sent: Third message")
            
            # Receive response
            response = await websocket.recv()
            print(f"Received: {response}")
            
    except Exception as e:
        print(f"Error connecting to basic WebSocket: {e}")

async def test_websocket_with_id():
    uri = "ws://localhost:8000/ws/456"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket endpoint with client ID")
            
            # Send a test message
            await websocket.send("Hello WebSocket with ID!")
            print("Sent: Hello WebSocket with ID!")
            
            # Receive personal response
            response = await websocket.recv()
            print(f"Personal response: {response}")
            
            # Receive broadcast response
            response = await websocket.recv()
            print(f"Broadcast response: {response}")
            
            # Send another message
            await websocket.send("Second message with ID")
            print("Sent: Second message with ID")
            
            # Receive personal response
            response = await websocket.recv()
            print(f"Personal response: {response}")
            
            # Receive broadcast response
            response = await websocket.recv()
            print(f"Broadcast response: {response}")
            
    except Exception as e:
        print(f"Error connecting to WebSocket with ID: {e}")

async def test_multiple_clients():
    uri1 = "ws://localhost:8000/ws/789"
    uri2 = "ws://localhost:8000/ws/789"
    
    try:
        async with websockets.connect(uri1) as websocket1:
            print("Client 1 connected to WebSocket endpoint with client ID")
            
            async with websockets.connect(uri2) as websocket2:
                print("Client 2 connected to WebSocket endpoint with client ID")
                
                # Send a message from client 1
                await websocket1.send("Message from client 1")
                print("Client 1 sent: Message from client 1")
                
                # Client 1 receives personal response
                response = await websocket1.recv()
                print(f"Client 1 personal response: {response}")
                
                # Client 1 receives broadcast response
                response = await websocket1.recv()
                print(f"Client 1 broadcast response: {response}")
                
                # Client 2 receives broadcast response
                response = await websocket2.recv()
                print(f"Client 2 broadcast response: {response}")
                
                # Send a message from client 2
                await websocket2.send("Message from client 2")
                print("Client 2 sent: Message from client 2")
                
                # Client 2 receives personal response
                response = await websocket2.recv()
                print(f"Client 2 personal response: {response}")
                
                # Client 1 receives broadcast response
                response = await websocket1.recv()
                print(f"Client 1 broadcast response: {response}")
                
                # Client 2 receives broadcast response
                response = await websocket2.recv()
                print(f"Client 2 broadcast response: {response}")
                
    except Exception as e:
        print(f"Error in multiple clients test: {e}")

async def main():
    print("Testing WebSocket endpoints...")
    await test_websocket_basic()
    print("\n" + "="*50 + "\n")
    await test_websocket_with_id()
    print("\n" + "="*50 + "\n")
    await test_multiple_clients()

if __name__ == "__main__":
    asyncio.run(main())