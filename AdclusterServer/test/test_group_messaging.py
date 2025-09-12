import asyncio
import websockets
import json

async def test_client(client_id, group, messages_to_send):
    uri = f"ws://localhost:8000/api/ws/{client_id}/{group}"
    async with websockets.connect(uri) as websocket:
        print(f"Client {client_id} connected to group {group}")
        
        # Listen for messages and send test messages
        async def listen():
            try:
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        if data.get("type") == "client_list":
                            print(f"Client {client_id} received client list: {data}")
                        else:
                            print(f"Client {client_id} received: {message}")
                    except json.JSONDecodeError:
                        print(f"Client {client_id} received: {message}")
            except websockets.exceptions.ConnectionClosed:
                print(f"Client {client_id} disconnected")
        
        # Send messages
        async def send_messages():
            for msg in messages_to_send:
                await asyncio.sleep(1)  # Wait a bit between messages
                await websocket.send(msg)
                print(f"Client {client_id} sent: {msg}")
        
        # Run both tasks concurrently
        await asyncio.gather(listen(), send_messages())

async def main():
    # Test Group A
    client_a1_task = asyncio.create_task(
        test_client(1, "A", ["/group Hello from Client A1", "/send_to 2 Private message from A1 to A2"])
    )
    
    client_a2_task = asyncio.create_task(
        test_client(2, "A", ["/group Hi from Client A2"])
    )
    
    # Test Group B
    client_b1_task = asyncio.create_task(
        test_client(3, "B", ["/group Hello from Client B1"])
    )
    
    # Wait for all clients to finish
    await asyncio.gather(client_a1_task, client_a2_task, client_b1_task)

if __name__ == "__main__":
    asyncio.run(main())