import asyncio
import websockets

async def test_websocket():
    # Connect to the WebSocket server
    uri = "ws://localhost:8000/ws/123"
    async with websockets.connect(uri) as websocket:
        # Receive the welcome message
        welcome = await websocket.recv()
        print(f"Received: {welcome}")
        
        # Send a message
        await websocket.send("Hello, server!")
        
        # Receive the response
        response = await websocket.recv()
        print(f"Received: {response}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
