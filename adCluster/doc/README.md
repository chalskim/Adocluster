# Adcluster Server

This is the backend server for the Adcluster project, built with FastAPI.

## Project Structure

```
.
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not in version control)
├── .gitignore              # Git ignore file
├── README.md              # This file (English)
├── README.ko.md           # Korean version of this file
├── socket_test.html       # WebSocket testing interface
├── group_messaging_test.html # Group messaging testing interface
├── uploads/               # File uploads directory
│   ├── images/            # Image uploads
│   ├── documents/         # Document uploads
│   └── files/             # Other file uploads
└── app/                   # Main application package
    ├── __init__.py
    ├── core/              # Core configuration
    │   ├── __init__.py
    │   ├── config.py      # Application configuration
    │   ├── database.py    # Database configuration
    │   ├── dependencies.py # Authentication dependencies
    │   ├── jwt.py         # JWT token handling
    │   └── security.py    # Password hashing utilities
    ├── routers/           # API routers
    │   ├── __init__.py
    │   ├── auth.py        # Authentication router
    │   ├── users.py       # Users router
    │   ├── websocket.py   # WebSocket router
    │   └── uploads_router.py # File upload router
    ├── schemas/           # Pydantic models
    │   ├── __init__.py
    │   ├── auth.py        # Authentication schemas
    │   └── user.py        # User schemas
    └── models/            # Database models
        ├── __init__.py
        ├── user.py        # User model
        ├── team.py        # Team model
        └── ...            # Other models
```

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up PostgreSQL database:
   - Install PostgreSQL on your system
   - Create a database and user according to the .env file
   - Update the .env file with your actual database credentials

4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

The server will start on `http://localhost:8000`.

## Environment Variables

Create a `.env` file in the root directory with the following variables:


## API Documentation

- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc`

## Authentication

The server implements JWT-based authentication:

1. Users log in via `POST /auth/login` with email and password
2. On successful authentication, the server returns a JWT access token
3. Clients include this token in the Authorization header for protected endpoints
4. Tokens expire after 30 minutes by default

## WebSocket Support

The server includes WebSocket endpoints for real-time communication:

1. `ws://localhost:8000/ws` - Basic WebSocket endpoint
2. `ws://localhost:8000/ws/{client_id}` - WebSocket endpoint with client identification
3. `ws://localhost:8000/ws/{client_id}/{group}` - WebSocket endpoint with client identification and group

### WebSocket Commands

- `/send_to <client_id> <message>` - Send a private message to a specific client
- `/group <message>` - Send a message to all clients in the same group
- `/join <group_name>` - Change your group membership

### Group Messaging

The server supports group-based messaging where clients can be organized into groups:

- Messages sent within a group are only delivered to clients in the same group
- Clients can switch groups dynamically using the `/join` command
- Private messages can be sent between any clients regardless of group membership
- **Group Management**: Clients can retrieve lists of groups and members in those groups

To test group messaging functionality, open `group_messaging_test.html` in a web browser.

## File Upload Support

The server includes file upload endpoints for handling file uploads:

- Files are automatically organized into subdirectories based on their type:
  - Images: `uploads/images/` (jpg, jpeg, png, gif, bmp, webp, tiff, svg)
  - Documents: `uploads/documents/` (txt, doc, docx, xls, xlsx, ppt, pptx, hwp, hwpx, pdf, rtf, odt, ods, odp)
  - Other files: `uploads/files/` (all other file types)
- All uploaded files are given unique names to prevent conflicts
- Files can be accessed via the static file server at `http://localhost:8000/uploads/`

## Endpoints

### General
- `GET /` - Welcome message
- `GET /health` - Health check

### Authentication
- `POST /auth/login` - User login (returns JWT token)

### Users
- `GET /users/` - Get list of users
- `GET /users/{user_id}` - Get specific user
- `GET /users/me` - Get current user profile (protected)
- `POST /users/` - Create new user

### WebSocket
- `WebSocket /ws` - Basic WebSocket endpoint
- `WebSocket /ws/{client_id}` - WebSocket endpoint with client identification
- `WebSocket /ws/{client_id}/{group}` - WebSocket endpoint with client identification and group
- `GET /api/ws/clients` - Get list of connected WebSocket clients
- `GET /api/ws/groups` - Get list of all created groups with member counts
- `GET /api/ws/groups/{group_name}` - Get members of a specific group
- `POST /api/ws/send_to/{client_id}` - Send message to specific client
- `POST /api/ws/broadcast_to_group/{group_name}` - Broadcast message to group

### File Upload
- `POST /api/upload` - Upload a single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/files` - List all uploaded files
- `DELETE /api/files/{filename}` - Delete a specific file
- `GET /uploads/{file_path}` - Access uploaded files (static file serving)