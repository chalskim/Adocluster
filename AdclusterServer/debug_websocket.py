import asyncio
import websockets

async def test_websocket_with_invalid_id():
    uri = "ws://localhost:8000/ws/abc"
    try:
        print("Attempting to connect to WebSocket with invalid client ID...")
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket!")
            # Try to send a message
            await websocket.send("Hello")
            print("Message sent")
            # Try to receive a response
            response = await websocket.recv()
            print(f"Received: {response}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed with code: {e.code}")
    except Exception as e:
        print(f"Error: {e}")

async def test_websocket_with_valid_id():
    uri = "ws://localhost:8000/ws/123"
    try:
        print("Attempting to connect to WebSocket with valid client ID...")
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket!")
            # Send a message
            await websocket.send("Hello")
            print("Message sent")
            # Receive responses
            personal_response = await websocket.recv()
            print(f"Personal response: {personal_response}")
            broadcast_response = await websocket.recv()
            print(f"Broadcast response: {broadcast_response}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed with code: {e.code}")
    except Exception as e:
        print(f"Error: {e}")

async def main():
    print("Testing WebSocket connections...")
    await test_websocket_with_valid_id()
    print("\n" + "="*50 + "\n")
    await test_websocket_with_invalid_id()

if __name__ == "__main__":
    asyncio.run(main())