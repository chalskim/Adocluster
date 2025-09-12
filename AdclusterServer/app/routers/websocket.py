from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set, Union, Optional
import json
import uuid
import psycopg2
import psycopg2.extras

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_info: Dict[str, dict] = {}  # Store client information with string keys
        self.websocket_to_id: Dict[int, str] = {}  # Map WebSocket id to connection ID
        self.id_to_websocket: Dict[str, WebSocket] = {}  # Map connection ID to WebSocket
        self.group_memberships: Dict[str, Set[str]] = {}  # Map group names to sets of connection IDs
        self.client_groups: Dict[str, str] = {}  # Map connection IDs to their current group

    async def connect(self, websocket: WebSocket, client_id: Optional[int] = None, group: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Generate a unique ID for this connection
        connection_id = str(uuid.uuid4())
        websocket_id = id(websocket)  # Use the id of the WebSocket object
        self.websocket_to_id[websocket_id] = connection_id
        self.id_to_websocket[connection_id] = websocket
        
        # Store client information
        self.client_info[connection_id] = {
            "client_id": client_id,
            "group": group,
            "connected_at": "now"  # In a real implementation, you might want to store actual timestamps
        }
        
        # Handle group membership
        if group:
            self.client_groups[connection_id] = group
            if group not in self.group_memberships:
                self.group_memberships[group] = set()
            self.group_memberships[group].add(connection_id)
        
        # Notify all clients about the new connection
        await self.broadcast_connected_clients()
        # Broadcast updated group information
        await self.broadcast_group_info()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
            # Get the websocket id
            websocket_id = id(websocket)
            
            # Get the connection ID
            if websocket_id in self.websocket_to_id:
                connection_id = self.websocket_to_id[websocket_id]
                
                # Remove group membership if exists
                if connection_id in self.client_groups:
                    group = self.client_groups[connection_id]
                    if group in self.group_memberships and connection_id in self.group_memberships[group]:
                        self.group_memberships[group].remove(connection_id)
                        # Clean up empty groups
                        if not self.group_memberships[group]:
                            del self.group_memberships[group]
                    del self.client_groups[connection_id]
                
                # Remove mappings
                del self.websocket_to_id[websocket_id]
                if connection_id in self.id_to_websocket:
                    del self.id_to_websocket[connection_id]
                
                # Remove client information
                if connection_id in self.client_info:
                    del self.client_info[connection_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_message_to_client_id(self, message: str, target_client_id: int):
        """Send a message to a specific client by client ID"""
        for connection_id, info in self.client_info.items():
            if info["client_id"] == target_client_id:
                if connection_id in self.id_to_websocket:
                    websocket = self.id_to_websocket[connection_id]
                    try:
                        await websocket.send_text(message)
                        return True  # Message sent successfully
                    except:
                        # Remove dead connection
                        self.disconnect(websocket)
                        return False  # Failed to send message
        return False  # Client not found

    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections[:]:  # Create a copy to avoid modification during iteration
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.disconnect(connection)

    async def broadcast_to_group(self, message: str, group: str):
        """Broadcast message to all clients in a specific group"""
        if group in self.group_memberships:
            for connection_id in list(self.group_memberships[group]):  # Create a copy to avoid modification during iteration
                if connection_id in self.id_to_websocket:
                    websocket = self.id_to_websocket[connection_id]
                    try:
                        await websocket.send_text(message)
                    except:
                        # Remove dead connections
                        self.disconnect(websocket)

    async def broadcast_connected_clients(self):
        """Broadcast the list of connected clients to all connected clients"""
        clients_info = []
        for connection_id, info in self.client_info.items():
            clients_info.append({
                "client_id": info["client_id"],
                "group": info.get("group"),
                "connected_at": info["connected_at"]
            })
        
        message = {
            "type": "client_list",
            "clients": clients_info
        }
        
        # Send to all connected clients
        for connection in self.active_connections[:]:  # Create a copy to avoid modification during iteration
            try:
                await connection.send_text(json.dumps(message))
            except:
                # Remove dead connections
                self.disconnect(connection)

    async def broadcast_group_info(self):
        """Broadcast the list of groups and their member counts to all connected clients"""
        groups = self.get_groups()
        
        message = {
            "type": "group_info",
            "groups": groups
        }
        
        # Send to all connected clients
        for connection in self.active_connections[:]:  # Create a copy to avoid modification during iteration
            try:
                await connection.send_text(json.dumps(message))
            except:
                # Remove dead connections
                self.disconnect(connection)

    def get_connected_clients(self):
        """Return the list of currently connected clients"""
        clients_info = []
        for connection_id, info in self.client_info.items():
            clients_info.append({
                "client_id": info["client_id"],
                "group": info.get("group"),
                "connected_at": info["connected_at"]
            })
        return clients_info

    def get_group_members(self, group: str):
        """Return the list of clients in a specific group"""
        members = []
        if group in self.group_memberships:
            for connection_id in self.group_memberships[group]:
                if connection_id in self.client_info:
                    info = self.client_info[connection_id]
                    members.append({
                        "client_id": info["client_id"],
                        "connected_at": info["connected_at"]
                    })
        return members

    def get_groups(self):
        """Return the list of all groups with their member counts"""
        groups = []
        for group_name, members in self.group_memberships.items():
            groups.append({
                "name": group_name,
                "member_count": len(members)
            })
        return groups

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message text was: {data}", websocket)
    except WebSocketDisconnect:
        print("\n\n*** WebSocket /ws disconnected normally ***\n\n")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"\n\n*** WebSocket /ws error: {str(e)} ***\n\n")
        try:
            await websocket.send_text(f"Server error: {str(e)}")
        except:
            pass
        manager.disconnect(websocket)

@router.websocket("/ws/{client_id}")
async def websocket_endpoint_with_id(websocket: WebSocket, client_id: str):
    # Validate client_id is a valid integer
    if not client_id.isdigit():
        # For WebSocket paths, we need to handle validation differently
        # Let's accept the connection but send an error message and then close
        await websocket.accept()
        await websocket.send_text("Error: Invalid client_id. Must be an integer.")
        await websocket.close(1003)  # Unsupported data
        return
        
    client_id_int = int(client_id)
        
    await manager.connect(websocket, client_id_int)
    try:
        # Send a welcome message to indicate successful connection
        await websocket.send_text(f"Connected as client #{client_id_int}")
        
        while True:
            data = await websocket.receive_text()
            # Check if this is a command to send a message to a specific client
            if data.startswith("/send_to "):
                # Parse the command: /send_to <target_client_id> <message>
                parts = data.split(" ", 2)
                if len(parts) >= 3:
                    try:
                        target_client_id = int(parts[1])
                        message = parts[2]
                        success = await manager.send_message_to_client_id(
                            f"Private message from client #{client_id_int}: {message}", 
                            target_client_id
                        )
                        if success:
                            await manager.send_personal_message(
                                f"Message sent to client #{target_client_id}", 
                                websocket
                            )
                        else:
                            await manager.send_personal_message(
                                f"Failed to send message to client #{target_client_id}. Client not found or disconnected.", 
                                websocket
                            )
                    except ValueError:
                        await manager.send_personal_message(
                            "Invalid target client ID. Please provide a valid integer.", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /send_to <target_client_id> <message>", 
                        websocket
                    )
            # Check if this is a command to join a group
            elif data.startswith("/join "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    # Remove from current group if exists
                    connection_id = manager.websocket_to_id.get(id(websocket))
                    if connection_id and connection_id in manager.client_groups:
                        old_group = manager.client_groups[connection_id]
                        if old_group in manager.group_memberships:
                            manager.group_memberships[old_group].discard(connection_id)
                            # Clean up empty groups
                            if not manager.group_memberships[old_group]:
                                del manager.group_memberships[old_group]
                    
                    # Add to new group
                    manager.client_groups[connection_id] = group_name  # type: ignore
                    if group_name not in manager.group_memberships:
                        manager.group_memberships[group_name] = set()  # type: ignore
                    manager.group_memberships[group_name].add(connection_id)  # type: ignore
                    manager.client_info[connection_id]["group"] = group_name  # type: ignore
                    
                    await manager.send_personal_message(
                        f"Joined group: {group_name}", 
                        websocket
                    )
                    # Notify all clients about the updated connection list
                    await manager.broadcast_connected_clients()
                    # Broadcast updated group information
                    await manager.broadcast_group_info()
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /join <group_name>", 
                        websocket
                    )
            # Check if this is a command to send a message to a group
            elif data.startswith("/group "):
                group_message = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_message:
                    connection_id = manager.websocket_to_id.get(id(websocket))
                    if connection_id and connection_id in manager.client_groups:
                        group_name = manager.client_groups[connection_id]
                        await manager.broadcast_to_group(
                            f"Group message from client #{client_id_int}: {group_message}", 
                            group_name
                        )
                    else:
                        await manager.send_personal_message(
                            "You are not in a group. Use /join <group_name> to join a group.", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /group <message>", 
                        websocket
                    )
            # Check if this is a command to list all groups
            elif data == "/groups":
                groups = manager.get_groups()
                await manager.send_personal_message(
                    f"Available groups: {json.dumps(groups)}", 
                    websocket
                )
            # Check if this is a command to get members of a specific group
            elif data.startswith("/group_members "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    members = manager.get_group_members(group_name)
                    await manager.send_personal_message(
                        f"Members in group '{group_name}': {json.dumps(members)}", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /group_members <group_name>", 
                        websocket
                    )
            else:
                await manager.send_personal_message(f"Client #{client_id_int} says: {data}", websocket)
                # Broadcast to the client's group instead of all clients
                connection_id = manager.websocket_to_id.get(id(websocket))
                if connection_id and connection_id in manager.client_groups:
                    group_name = manager.client_groups[connection_id]
                    await manager.broadcast_to_group(
                        f"Client #{client_id_int}: {data}", 
                        group_name
                    )
                else:
                    # If not in a group, broadcast to all clients
                    await manager.broadcast(f"Client #{client_id_int}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()
        await manager.broadcast(f"Client #{client_id_int} has disconnected")

@router.websocket("/ws/{client_id}/{group}")
async def websocket_endpoint_with_id_and_group(websocket: WebSocket, client_id: str, group: str):
    # Validate client_id is a valid integer
    if not client_id.isdigit():
        # For WebSocket paths, we need to handle validation differently
        # Let's accept the connection but send an error message and then close
        await websocket.accept()
        await websocket.send_text("Error: Invalid client_id. Must be an integer.")
        await websocket.close(1003)  # Unsupported data
        return
        
    client_id_int = int(client_id)
        
    await manager.connect(websocket, client_id_int, group)
    try:
        # Send a welcome message to indicate successful connection
        await websocket.send_text(f"Connected as client #{client_id_int} in group '{group}'")
        
        while True:
            data = await websocket.receive_text()
            # Check if this is a command to send a message to a specific client
            if data.startswith("/send_to "):
                # Parse the command: /send_to <target_client_id> <message>
                parts = data.split(" ", 2)
                if len(parts) >= 3:
                    try:
                        target_client_id = int(parts[1])
                        message = parts[2]
                        success = await manager.send_message_to_client_id(
                            f"Private message from client #{client_id_int}: {message}", 
                            target_client_id
                        )
                        if success:
                            await manager.send_personal_message(
                                f"Message sent to client #{target_client_id}", 
                                websocket
                            )
                        else:
                            await manager.send_personal_message(
                                f"Failed to send message to client #{target_client_id}. Client not found or disconnected.", 
                                websocket
                            )
                    except ValueError:
                        await manager.send_personal_message(
                            "Invalid target client ID. Please provide a valid integer.", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /send_to <target_client_id> <message>", 
                        websocket
                    )
            # Check if this is a command to send a message to the group
            elif data.startswith("/group "):
                group_message = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_message:
                    await manager.broadcast_to_group(
                        f"Group message from client #{client_id_int}: {group_message}", 
                        group
                    )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /group <message>", 
                        websocket
                    )
            # Check if this is a command to list all groups
            elif data == "/groups":
                groups = manager.get_groups()
                await manager.send_personal_message(
                    f"Available groups: {json.dumps(groups)}", 
                    websocket
                )
            # Check if this is a command to get members of a specific group
            elif data.startswith("/group_members "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    members = manager.get_group_members(group_name)
                    await manager.send_personal_message(
                        f"Members in group '{group_name}': {json.dumps(members)}", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /group_members <group_name>", 
                        websocket
                    )
            else:
                await manager.send_personal_message(f"Client #{client_id_int} says: {data}", websocket)
                # Broadcast to the client's group
                await manager.broadcast_to_group(
                    f"Client #{client_id_int}: {data}", 
                    group
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()
        await manager.broadcast(f"Client #{client_id_int} has disconnected")

@router.get("/ws/clients")
async def get_connected_clients():
    """HTTP endpoint to get the list of connected WebSocket clients"""
    return {"clients": manager.get_connected_clients()}

@router.get("/ws/groups")
async def get_groups():
    """HTTP endpoint to get the list of all groups"""
    return {"groups": manager.get_groups()}

@router.get("/ws/groups/{group_name}")
async def get_group_members(group_name: str):
    """HTTP endpoint to get the list of members in a specific group"""
    return {"group": group_name, "members": manager.get_group_members(group_name)}

@router.post("/ws/send_to/{client_id}")
async def send_message_to_client(client_id: int, message: dict):
    """HTTP endpoint to send a message to a specific client by client ID"""
    text_message = message.get("message", "Server message")
    success = await manager.send_message_to_client_id(
        f"Server message to client #{client_id}: {text_message}", 
        client_id
    )
    if success:
        return {"status": "success", "message": f"Message sent to client #{client_id}"}
    else:
        return {"status": "error", "message": f"Failed to send message to client #{client_id}. Client not found or disconnected."}

@router.post("/ws/broadcast_to_group/{group_name}")
async def broadcast_message_to_group(group_name: str, message: dict):
    """HTTP endpoint to broadcast a message to all clients in a specific group"""
    text_message = message.get("message", "Server message")
    await manager.broadcast_to_group(
        f"Server broadcast to group '{group_name}': {text_message}", 
        group_name
    )
    return {"status": "success", "message": f"Message broadcast to group '{group_name}'"}

# Database query handling via WebSocket
import psycopg2
import psycopg2.extras

@router.websocket("/ws/db")
async def database_websocket_endpoint(websocket: WebSocket):
    print("\n\n*** WebSocket connection to /ws/db received ***\n\n")
    await websocket.accept()
    print("\n\n*** WebSocket connection to /ws/db accepted ***\n\n")
    try:
        while True:
            print("\n\n*** Waiting for data from client ***\n\n")
            try:
                data = await websocket.receive_json()
                print(f"\n\n*** WebSocket data received: {data} ***\n\n")
                action = data.get("action")
                print(f"\n\n*** Action: {action} ***\n\n")
                
                # Validate client_id if provided
                client_id = data.get("client_id")
                print(f"\n\n*** Client ID received: {client_id}, type: {type(client_id)} ***\n\n")
                if client_id is not None:
                    try:
                        # Ensure client_id is an integer
                        if isinstance(client_id, str):
                            client_id = int(client_id)
                        elif not isinstance(client_id, int):
                            raise ValueError(f"client_id must be an integer, got {type(client_id)}")
                        
                        print(f"\n\n*** Client ID processed: {client_id}, final type: {type(client_id)} ***\n\n")
                    except ValueError as e:
                        error_msg = f"Error: Invalid client_id. Must be an integer. Details: {str(e)}"
                        print(f"\n\n*** {error_msg} ***\n\n")
                        await websocket.send_json({"status": "error", "message": error_msg})
                        continue
            except Exception as e:
                print(f"\n\n*** Error receiving WebSocket data: {str(e)} ***\n\n")
                await websocket.send_text(f"Error: {str(e)}")
                continue
            
            if action == "connect":
                print("\n\n*** Processing connect action ***\n\n")
                # Connect to database
                try:
                    conn_params = {
                        "host": data.get("host", "localhost"),
                        "port": data.get("port", 5432),
                        "database": data.get("database"),
                        "user": data.get("user"),
                        "password": data.get("password")
                    }
                    
                    print(f"\n\n*** Database connection attempt: {conn_params['host']}:{conn_params['port']} - {conn_params['database']} - {conn_params['user']} ***\n\n")
                    
                    # Validate required parameters
                    if not all([conn_params["database"], conn_params["user"]]):
                        print("\n\n*** Missing required connection parameters ***\n\n")
                        await websocket.send_json({
                            "status": "error",
                            "message": "Missing required connection parameters"
                        })
                        continue
                    
                    # Attempt to connect
                    try:
                        print("\n\n*** Attempting database connection ***\n\n")
                        conn = psycopg2.connect(**conn_params)
                        print(f"\n\n*** Database connection successful ***\n\n")
                        
                        # Store connection in WebSocket state
                        websocket.state.db_conn = conn
                        
                        await websocket.send_json({
                            "status": "success",
                            "message": f"Connected to {conn_params['database']} at {conn_params['host']}:{conn_params['port']}"
                        })
                        print("\n\n*** Success response sent ***\n\n")
                    except psycopg2.OperationalError as e:
                        error_message = str(e)
                        print(f"\n\n*** Database connection error (OperationalError): {error_message} ***\n\n")
                        await websocket.send_json({
                            "status": "error",
                            "message": f"Database connection error: {error_message}"
                        })
                except Exception as e:
                    print(f"\n\n*** General connection error: {str(e)} ***\n\n")
                    await websocket.send_json({
                        "status": "error",
                        "message": f"Database connection error: {str(e)}"
                    })
            
            elif action == "disconnect":
                # Disconnect from database
                if hasattr(websocket.state, "db_conn"):
                    try:
                        websocket.state.db_conn.close()
                        delattr(websocket.state, "db_conn")
                        await websocket.send_json({
                            "status": "success",
                            "message": "Disconnected from database"
                        })
                    except Exception as e:
                        await websocket.send_json({
                            "status": "error",
                            "message": f"Error disconnecting from database: {str(e)}"
                        })
                else:
                    await websocket.send_json({
                        "status": "error",
                        "message": "Not connected to any database"
                    })
            
            elif action == "query":
                # Execute SQL query
                if not hasattr(websocket.state, "db_conn"):
                    await websocket.send_json({
                        "status": "error",
                        "message": "Not connected to any database"
                    })
                    continue
                
                query = data.get("query")
                if not query:
                    await websocket.send_json({
                        "status": "error",
                        "message": "No query provided"
                    })
                    continue
                
                try:
                    conn = websocket.state.db_conn
                    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                    cursor.execute(query)
                    
                    # Handle different query types
                    if query.lower().strip().startswith("select"):
                        # SELECT query
                        rows = cursor.fetchall()
                        columns = [desc[0] for desc in cursor.description] if cursor.description else []
                        
                        await websocket.send_json({
                            "status": "success",
                            "result_type": "select",
                            "columns": columns,
                            "rows": rows,
                            "row_count": len(rows)
                        })
                    else:
                        # DML query (INSERT, UPDATE, DELETE)
                        conn.commit()
                        rows_affected = cursor.rowcount
                        
                        await websocket.send_json({
                            "status": "success",
                            "result_type": "dml",
                            "message": "Query executed successfully",
                            "rows_affected": rows_affected
                        })
                    
                    cursor.close()
                except Exception as e:
                    # Rollback on error
                    if hasattr(websocket.state, "db_conn"):
                        websocket.state.db_conn.rollback()
                    
                    await websocket.send_json({
                        "status": "error",
                        "message": f"Query execution error: {str(e)}"
                    })
            
            else:
                await websocket.send_json({
                    "status": "error",
                    "message": f"Unknown action: {action}"
                })
                
    except WebSocketDisconnect:
        print("\n\n*** WebSocket disconnected normally ***\n\n")
        # Clean up database connection if exists
        if hasattr(websocket.state, "db_conn"):
            try:
                websocket.state.db_conn.close()
                print("\n\n*** Database connection closed on disconnect ***\n\n")
            except Exception as cleanup_error:
                print(f"\n\n*** Error closing database connection: {cleanup_error} ***\n\n")
    except Exception as e:
        print(f"\n\n*** WebSocket error: {str(e)} ***\n\n")
        import traceback
        print(f"\n\n*** Full traceback: {traceback.format_exc()} ***\n\n")
        try:
            await websocket.send_json({
                "status": "error",
                "message": f"Server error: {str(e)}"
            })
        except Exception as send_error:
            print(f"\n\n*** Error sending error message: {send_error} ***\n\n")
        # Clean up database connection if exists
        if hasattr(websocket.state, "db_conn"):
            try:
                websocket.state.db_conn.close()
                print("\n\n*** Database connection closed on error ***\n\n")
            except Exception as cleanup_error:
                print(f"\n\n*** Error closing database connection: {cleanup_error} ***\n\n")