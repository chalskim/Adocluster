from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import List, Dict, Set, Union, Optional
from fastapi.security import OAuth2PasswordBearer
import json
import uuid
import psycopg2
import psycopg2.extras
import random

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_info: Dict[str, dict] = {}  # Store client information with string keys
        self.websocket_to_id: Dict[int, str] = {}  # Map WebSocket id to connection ID
        self.id_to_websocket: Dict[str, WebSocket] = {}  # Map connection ID to WebSocket
        self.group_memberships: Dict[str, Set[str]] = {}  # Map group names to sets of connection IDs
        self.client_groups: Dict[str, Set[str]] = {}  # Map connection IDs to their groups (multiple groups)
        self.string_to_numeric_id: Dict[str, int] = {}  # Map string IDs to numeric IDs
        self.numeric_to_string_id: Dict[int, str] = {}  # Map numeric IDs to string IDs
        self.user_info: Dict[str, dict] = {}  # Map connection IDs to user information

    async def connect(self, websocket: WebSocket, client_id: Optional[Union[int, str]] = None, group: Optional[str] = None, user_data: Optional[dict] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Generate a unique ID for this connection
        connection_id = str(uuid.uuid4())
        websocket_id = id(websocket)  # Use the id of the WebSocket object
        self.websocket_to_id[websocket_id] = connection_id
        self.id_to_websocket[connection_id] = websocket
        
        # Handle client ID mapping
        numeric_client_id = None
        if client_id is not None:
            # If client_id is provided, create mapping
            if isinstance(client_id, str):
                # Generate a unique numeric ID for string client IDs
                numeric_client_id = self._generate_unique_numeric_id()
                self.string_to_numeric_id[client_id] = numeric_client_id
                self.numeric_to_string_id[numeric_client_id] = client_id
            else:
                # If it's already numeric, use it directly
                numeric_client_id = client_id
        
        # Store client information
        self.client_info[connection_id] = {
            "client_id": numeric_client_id,
            "original_client_id": client_id,
            "groups": set() if not group else {group},
            "connected_at": "now"  # In a real implementation, you might want to store actual timestamps
        }
        
        # Handle group membership
        if group:
            if connection_id not in self.client_groups:
                self.client_groups[connection_id] = set()
            self.client_groups[connection_id].add(group)
            
            if group not in self.group_memberships:
                self.group_memberships[group] = set()
            self.group_memberships[group].add(connection_id)
        
        # Store user information if provided
        if user_data:
            self.user_info[connection_id] = user_data
        
        # Notify all clients about the new connection
        await self.broadcast_connected_clients()
        # Broadcast updated group information
        await self.broadcast_group_info()

    def _generate_unique_numeric_id(self) -> int:
        """Generate a unique numeric ID that doesn't conflict with existing IDs"""
        while True:
            # Generate a random numeric ID between 1000 and 999999
            numeric_id = random.randint(1000, 999999)
            if numeric_id not in self.numeric_to_string_id:
                return numeric_id

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
            # Get the websocket id
            websocket_id = id(websocket)
            
            # Get the connection ID
            if websocket_id in self.websocket_to_id:
                connection_id = self.websocket_to_id[websocket_id]
                
                # Clean up ID mappings if they exist
                if connection_id in self.client_info:
                    client_data = self.client_info[connection_id]
                    original_id = client_data.get("original_client_id")
                    numeric_id = client_data.get("client_id")
                    
                    # Remove mappings
                    if isinstance(original_id, str) and original_id in self.string_to_numeric_id:
                        del self.string_to_numeric_id[original_id]
                    if numeric_id and numeric_id in self.numeric_to_string_id:
                        del self.numeric_to_string_id[numeric_id]
                
                # Remove group membership if exists
                if connection_id in self.client_groups:
                    groups = self.client_groups[connection_id].copy()  # Create a copy to avoid modification during iteration
                    for group in groups:
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
        try:
            await websocket.send_text(message)
        except:
            # Remove dead connection
            self.disconnect(websocket)

    async def send_message_to_client_id(self, message: str, target_client_id: Union[int, str]):
        """Send a message to a specific client by client ID (either numeric or string)"""
        # Resolve the target client ID to a numeric ID if it's a string
        if isinstance(target_client_id, str):
            if target_client_id not in self.string_to_numeric_id:
                return False  # String ID not found
            target_client_id = self.string_to_numeric_id[target_client_id]
        
        # Find the connection with this numeric ID
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

    async def broadcast_to_groups(self, message: str, groups: Set[str]):
        """Broadcast message to all clients in multiple groups"""
        for group in groups:
            await self.broadcast_to_group(message, group)

    async def broadcast_connected_clients(self):
        """Broadcast the list of connected clients to all connected clients"""
        clients_info = []
        for connection_id, info in self.client_info.items():
            # Create comprehensive client information with key-value pairs
            client_data = {
                "connection_id": connection_id,  # Unique connection identifier
                "client_id": info["client_id"],  # Numeric client ID
                "original_client_id": info["original_client_id"],  # Original client ID (could be string or numeric)
                "groups": list(info.get("groups", set())),  # Groups the client belongs to
                "connected_at": info["connected_at"]  # Connection timestamp
            }
            
            # Add user information if available
            if connection_id in self.user_info:
                client_data["user"] = self.user_info[connection_id]
                
            # Add mapping information
            if info["client_id"] and info["original_client_id"]:
                if isinstance(info["original_client_id"], str):
                    client_data["id_mapping"] = {
                        "string_id": info["original_client_id"],
                        "numeric_id": info["client_id"]
                    }
                else:
                    client_data["id_mapping"] = {
                        "numeric_id": info["original_client_id"]
                    }
            
            clients_info.append(client_data)
        
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
        """Return the list of currently connected clients with comprehensive key-value information"""
        clients_info = []
        for connection_id, info in self.client_info.items():
            # Create comprehensive client information with key-value pairs
            client_data = {
                "connection_id": connection_id,  # Unique connection identifier
                "client_id": info["client_id"],  # Numeric client ID
                "original_client_id": info["original_client_id"],  # Original client ID (could be string or numeric)
                "groups": list(info.get("groups", set())),  # Groups the client belongs to
                "connected_at": info["connected_at"]  # Connection timestamp
            }
            
            # Add user information if available
            if connection_id in self.user_info:
                client_data["user"] = self.user_info[connection_id]
                
            # Add mapping information
            if info["client_id"] and info["original_client_id"]:
                if isinstance(info["original_client_id"], str):
                    client_data["id_mapping"] = {
                        "string_id": info["original_client_id"],
                        "numeric_id": info["client_id"]
                    }
                else:
                    client_data["id_mapping"] = {
                        "numeric_id": info["original_client_id"]
                    }
            
            clients_info.append(client_data)
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
                        "original_client_id": info["original_client_id"],
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

    async def join_group(self, websocket: WebSocket, group_name: str):
        """Add a client to a group"""
        connection_id = self.websocket_to_id.get(id(websocket))
        if not connection_id:
            return False
            
        # Add to client's groups
        if connection_id not in self.client_groups:
            self.client_groups[connection_id] = set()
        self.client_groups[connection_id].add(group_name)
        
        # Add to group memberships
        if group_name not in self.group_memberships:
            self.group_memberships[group_name] = set()
        self.group_memberships[group_name].add(connection_id)
        
        # Update client info
        if connection_id in self.client_info:
            if "groups" not in self.client_info[connection_id]:
                self.client_info[connection_id]["groups"] = set()
            self.client_info[connection_id]["groups"].add(group_name)
        
        # Notify all clients about the updated connection list
        await self.broadcast_connected_clients()
        # Broadcast updated group information
        await self.broadcast_group_info()
        
        return True

    async def leave_group(self, websocket: WebSocket, group_name: str):
        """Remove a client from a group"""
        connection_id = self.websocket_to_id.get(id(websocket))
        if not connection_id:
            return False
            
        # Remove from client's groups
        if connection_id in self.client_groups and group_name in self.client_groups[connection_id]:
            self.client_groups[connection_id].discard(group_name)
            
            # Remove from group memberships
            if group_name in self.group_memberships and connection_id in self.group_memberships[group_name]:
                self.group_memberships[group_name].discard(connection_id)
                # Clean up empty groups
                if not self.group_memberships[group_name]:
                    del self.group_memberships[group_name]
            
            # Update client info
            if connection_id in self.client_info and "groups" in self.client_info[connection_id]:
                self.client_info[connection_id]["groups"].discard(group_name)
            
            # Notify all clients about the updated connection list
            await self.broadcast_connected_clients()
            # Broadcast updated group information
            await self.broadcast_group_info()
            
            return True
        return False

    async def leave_all_groups(self, websocket: WebSocket):
        """Remove a client from all groups"""
        connection_id = self.websocket_to_id.get(id(websocket))
        if not connection_id:
            return False
            
        # Get all groups the client is in
        if connection_id in self.client_groups:
            groups = self.client_groups[connection_id].copy()  # Create a copy to avoid modification during iteration
            for group_name in groups:
                await self.leave_group(websocket, group_name)
        
        return True

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

@router.websocket("/ws/auth")
async def websocket_endpoint_auth(websocket: WebSocket, token: str):
    """WebSocket endpoint that requires JWT authentication"""
    try:
        # Import dependencies here to avoid circular imports
        from app.core.dependencies import get_current_user
        from app.core.database import get_db
        from app.core.jwt import verify_token
        from sqlalchemy.orm import Session
        
        # Verify the JWT token
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        # Get database session
        db_gen = get_db()
        db = next(db_gen)
        
        try:
            token_data = verify_token(token, credentials_exception)
            user = get_current_user(token, db)
            
            # Create user data to store
            user_data = {
                "user_id": str(user.uid),
                "username": user.uname,
                "email": user.uemail
            }
            
            # Connect with user information
            await manager.connect(websocket, user_data=user_data)
            
            # Send welcome message with user information
            await websocket.send_text(f"Connected as authenticated user: {user.uname} ({user.uemail})")
            
            try:
                while True:
                    data = await websocket.receive_text()
                    await manager.send_personal_message(f"Message text was: {data}", websocket)
            except WebSocketDisconnect:
                print("\n\n*** WebSocket /ws/auth disconnected normally ***\n\n")
                manager.disconnect(websocket)
            except Exception as e:
                print(f"\n\n*** WebSocket /ws/auth error: {str(e)} ***\n\n")
                try:
                    await websocket.send_text(f"Server error: {str(e)}")
                except:
                    pass
                manager.disconnect(websocket)
        finally:
            # Close database session
            db.close()
    except Exception as e:
        print(f"\n\n*** WebSocket authentication error: {str(e)} ***\n\n")
        try:
            await websocket.send_text(f"Authentication error: {str(e)}")
        except:
            pass
        await websocket.close()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint_with_id(websocket: WebSocket, client_id: str):
    print(f"WebSocket connection attempt with client_id: {client_id}")
    # Validate client_id - now we accept both numeric and string IDs
    # For backward compatibility, we still validate numeric IDs
    client_id_value = client_id
    if client_id.isdigit():
        client_id_value = int(client_id)
        
    print(f"Valid client_id received: {client_id_value}")
        
    await manager.connect(websocket, client_id_value)
    try:
        # Send a welcome message to indicate successful connection
        if isinstance(client_id_value, int):
            await websocket.send_text(f"Connected as client #{client_id_value}")
        else:
            # For string IDs, we show both the original and the mapped numeric ID
            numeric_id = manager.string_to_numeric_id.get(client_id_value)
            await websocket.send_text(f"Connected as client '{client_id_value}' (mapped to numeric ID: {numeric_id})")
        
        while True:
            data = await websocket.receive_text()
            print(f"Received message from client '{client_id_value}': {data}")
            # Check if this is a command to send a message to a specific client
            if data.startswith("/send_to "):
                # Parse the command: /send_to <target_client_id> <message>
                parts = data.split(" ", 2)
                if len(parts) >= 3:
                    try:
                        target_client_id = parts[1]
                        # Try to convert to int if it's numeric
                        if target_client_id.isdigit():
                            target_client_id = int(target_client_id)
                        message = parts[2]
                        success = await manager.send_message_to_client_id(
                            f"Private message from client '{client_id_value}': {message}", 
                            target_client_id
                        )
                        if success:
                            await manager.send_personal_message(
                                f"Message sent to client '{target_client_id}'", 
                                websocket
                            )
                        else:
                            await manager.send_personal_message(
                                f"Failed to send message to client '{target_client_id}'. Client not found or disconnected.", 
                                websocket
                            )
                    except ValueError:
                        await manager.send_personal_message(
                            "Invalid target client ID.", 
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
                    success = await manager.join_group(websocket, group_name)
                    if success:
                        await manager.send_personal_message(
                            f"Joined group: {group_name}", 
                            websocket
                        )
                    else:
                        await manager.send_personal_message(
                            f"Failed to join group: {group_name}", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /join <group_name>", 
                        websocket
                    )
            # Check if this is a command to leave a group
            elif data.startswith("/leave "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    success = await manager.leave_group(websocket, group_name)
                    if success:
                        await manager.send_personal_message(
                            f"Left group: {group_name}", 
                            websocket
                        )
                    else:
                        await manager.send_personal_message(
                            f"Failed to leave group: {group_name}", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /leave <group_name>", 
                        websocket
                    )
            # Check if this is a command to leave all groups
            elif data == "/leave_all":
                success = await manager.leave_all_groups(websocket)
                if success:
                    await manager.send_personal_message(
                        "Left all groups", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "Failed to leave all groups", 
                        websocket
                    )
            # Check if this is a command to list client's groups
            elif data == "/my_groups":
                connection_id = manager.websocket_to_id.get(id(websocket))
                if connection_id and connection_id in manager.client_groups:
                    groups = list(manager.client_groups[connection_id])
                    await manager.send_personal_message(
                        f"Your groups: {groups}", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "You are not in any groups", 
                        websocket
                    )
            # Check if this is a command to send a message to a group
            elif data.startswith("/group "):
                group_message = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_message:
                    connection_id = manager.websocket_to_id.get(id(websocket))
                    if connection_id and connection_id in manager.client_groups:
                        groups = manager.client_groups[connection_id]
                        if groups:
                            for group_name in groups:
                                await manager.broadcast_to_group(
                                    f"Group message from client '{client_id_value}': {group_message}", 
                                    group_name
                                )
                            await manager.send_personal_message(
                                f"Message sent to groups: {list(groups)}", 
                                websocket
                            )
                        else:
                            await manager.send_personal_message(
                                "You are not in any groups. Use /join <group_name> to join a group.", 
                                websocket
                            )
                    else:
                        await manager.send_personal_message(
                            "You are not in any groups. Use /join <group_name> to join a group.", 
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
                await manager.send_personal_message(f"Client '{client_id_value}' says: {data}", websocket)
                # Broadcast to all client's groups instead of all clients
                connection_id = manager.websocket_to_id.get(id(websocket))
                if connection_id and connection_id in manager.client_groups:
                    groups = manager.client_groups[connection_id]
                    if groups:
                        for group_name in groups:
                            await manager.broadcast_to_group(
                                f"Client '{client_id_value}': {data}", 
                                group_name
                            )
                    else:
                        # If not in any groups, broadcast to all clients
                        await manager.broadcast(f"Client '{client_id_value}': {data}")
                else:
                    # If not in any groups, broadcast to all clients
                    await manager.broadcast(f"Client '{client_id_value}': {data}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for client '{client_id_value}'")
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()
        await manager.broadcast(f"Client '{client_id_value}' has disconnected")
    except Exception as e:
        # Handle any other exceptions that might occur
        print(f"Error in WebSocket connection for client '{client_id_value}': {e}")
        try:
            await websocket.send_text(f"Server error: {str(e)}")
        except Exception as send_error:
            print(f"Failed to send error message to client '{client_id_value}': {send_error}")
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()

@router.websocket("/ws/{client_id}/{group}")
async def websocket_endpoint_with_id_and_group(websocket: WebSocket, client_id: str, group: str):
    print(f"WebSocket connection attempt with client_id: {client_id} and group: {group}")
    # Validate client_id - now we accept both numeric and string IDs
    # For backward compatibility, we still validate numeric IDs
    client_id_value = client_id
    if client_id.isdigit():
        client_id_value = int(client_id)
        
    print(f"Valid client_id received: {client_id_value}")
        
    await manager.connect(websocket, client_id_value, group)
    try:
        # Send a welcome message to indicate successful connection
        if isinstance(client_id_value, int):
            await websocket.send_text(f"Connected as client #{client_id_value} in group '{group}'")
        else:
            # For string IDs, we show both the original and the mapped numeric ID
            numeric_id = manager.string_to_numeric_id.get(client_id_value)
            await websocket.send_text(f"Connected as client '{client_id_value}' (mapped to numeric ID: {numeric_id}) in group '{group}'")
        
        while True:
            data = await websocket.receive_text()
            print(f"Received message from client '{client_id_value}' in group {group}: {data}")
            # Check if this is a command to send a message to a specific client
            if data.startswith("/send_to "):
                # Parse the command: /send_to <target_client_id> <message>
                parts = data.split(" ", 2)
                if len(parts) >= 3:
                    try:
                        target_client_id = parts[1]
                        # Try to convert to int if it's numeric
                        if target_client_id.isdigit():
                            target_client_id = int(target_client_id)
                        message = parts[2]
                        success = await manager.send_message_to_client_id(
                            f"Private message from client '{client_id_value}': {message}", 
                            target_client_id
                        )
                        if success:
                            await manager.send_personal_message(
                                f"Message sent to client '{target_client_id}'", 
                                websocket
                            )
                        else:
                            await manager.send_personal_message(
                                f"Failed to send message to client '{target_client_id}'. Client not found or disconnected.", 
                                websocket
                            )
                    except ValueError:
                        await manager.send_personal_message(
                            "Invalid target client ID.", 
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
                        f"Group message from client '{client_id_value}': {group_message}", 
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
            # Check if this is a command to join additional groups
            elif data.startswith("/join "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    success = await manager.join_group(websocket, group_name)
                    if success:
                        await manager.send_personal_message(
                            f"Joined group: {group_name}", 
                            websocket
                        )
                    else:
                        await manager.send_personal_message(
                            f"Failed to join group: {group_name}", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /join <group_name>", 
                        websocket
                    )
            # Check if this is a command to leave a group
            elif data.startswith("/leave "):
                group_name = data.split(" ", 1)[1] if len(data.split(" ", 1)) > 1 else None
                if group_name:
                    success = await manager.leave_group(websocket, group_name)
                    if success:
                        await manager.send_personal_message(
                            f"Left group: {group_name}", 
                            websocket
                        )
                    else:
                        await manager.send_personal_message(
                            f"Failed to leave group: {group_name}", 
                            websocket
                        )
                else:
                    await manager.send_personal_message(
                        "Invalid command format. Use: /leave <group_name>", 
                        websocket
                    )
            # Check if this is a command to leave all groups
            elif data == "/leave_all":
                success = await manager.leave_all_groups(websocket)
                if success:
                    await manager.send_personal_message(
                        "Left all groups", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "Failed to leave all groups", 
                        websocket
                    )
            # Check if this is a command to list client's groups
            elif data == "/my_groups":
                connection_id = manager.websocket_to_id.get(id(websocket))
                if connection_id and connection_id in manager.client_groups:
                    groups = list(manager.client_groups[connection_id])
                    await manager.send_personal_message(
                        f"Your groups: {groups}", 
                        websocket
                    )
                else:
                    await manager.send_personal_message(
                        "You are not in any groups", 
                        websocket
                    )
            else:
                await manager.send_personal_message(f"Client '{client_id_value}' says: {data}", websocket)
                # Broadcast to the client's groups (including the initial group)
                connection_id = manager.websocket_to_id.get(id(websocket))
                if connection_id and connection_id in manager.client_groups:
                    groups = manager.client_groups[connection_id]
                    if groups:
                        for group_name in groups:
                            await manager.broadcast_to_group(
                                f"Client '{client_id_value}': {data}", 
                                group_name
                            )
                    else:
                        # If not in any groups, broadcast to the initial group
                        await manager.broadcast_to_group(
                            f"Client '{client_id_value}': {data}", 
                            group
                        )
                else:
                    # If not in any groups, broadcast to the initial group
                    await manager.broadcast_to_group(
                        f"Client '{client_id_value}': {data}", 
                        group
                    )
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for client '{client_id_value}' in group {group}")
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()
        await manager.broadcast(f"Client '{client_id_value}' has disconnected")
    except Exception as e:
        # Handle any other exceptions that might occur
        print(f"Error in WebSocket connection for client '{client_id_value}' in group {group}: {e}")
        try:
            await websocket.send_text(f"Server error: {str(e)}")
        except Exception as send_error:
            print(f"Failed to send error message to client '{client_id_value}' in group {group}: {send_error}")
        manager.disconnect(websocket)
        # Notify all clients about the disconnection
        await manager.broadcast_connected_clients()
        await manager.broadcast_group_info()

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
async def send_message_to_client(client_id: str, message: dict):
    """HTTP endpoint to send a message to a specific client by client ID (supports both numeric and string IDs)"""
    # Try to convert to int if it's numeric
    target_client_id = client_id
    if client_id.isdigit():
        target_client_id = int(client_id)
        
    text_message = message.get("message", "Server message")
    success = await manager.send_message_to_client_id(
        f"Server message to client '{target_client_id}': {text_message}", 
        target_client_id
    )
    if success:
        return {"status": "success", "message": f"Message sent to client '{target_client_id}'"}
    else:
        return {"status": "error", "message": f"Failed to send message to client '{target_client_id}'. Client not found or disconnected."}

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
                    # Accept both string and integer client IDs
                    # No need to convert to int, just validate it's a valid type
                    if not isinstance(client_id, (int, str)):
                        error_msg = f"Error: Invalid client_id. Must be an integer or string. Got {type(client_id)}"
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