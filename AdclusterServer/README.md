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
├── db/                    # Database related scripts
│   ├── db_full_backup.py  # Database full backup script
│   ├── db_restore.py      # Database restore script
│   ├── db_web_gui.py      # Database web GUI
│   └── ...                # Other database related scripts
├── dbBackup/              # Database backup files directory
│   └── full_backup_*.sql  # Backup files
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

## Database Connection Failure Handling

The server is designed to operate reliably even during database connection failures:

- **Automatic Retry Mechanism**: Automatically attempts to reconnect when database connections fail
- **Graceful Degradation**: Core functionality continues to operate even when database connections are unavailable
- **Memory Caching**: Critical data is cached in memory to maintain service during temporary database outages
- **Error Logging and Alerts**: Generates detailed logs and sends administrator alerts when database connection issues occur
- **Workflow Manager**: Continues workflow execution and safely handles results even when database connections fail during workflow execution

These features significantly enhance the system's stability and resilience, minimizing service disruptions during database server maintenance or temporary network issues.

## Database Backup and Restore

The server includes utilities for database backup and restoration:

### Backup

The `db/db_full_backup.py` script creates a complete backup of the PostgreSQL database and stores it in the `dbBackup` folder:

- **Full Database Backup**: Uses `pg_dumpall` to create a comprehensive backup of all databases, roles, and tablespaces
- **Automatic Naming**: Generates backup files with timestamp-based names (e.g., `full_backup_YYYY-MM-DD.sql`)
- **Environment Integration**: Automatically retrieves database credentials from the `.env` file
- **Customizable**: Allows specifying a custom backup filename via command-line argument

Usage:
```bash
# Create backup with default name (full_backup_YYYY-MM-DD.sql)
python db/db_full_backup.py

# Create backup with custom name
python db/db_full_backup.py my_backup.sql
```

### Restore

The `db/db_restore.py` script restores the database from a backup file stored in the `dbBackup` folder:

- **Smart Backup Selection**: Automatically finds and uses the latest backup file if none is specified
- **Safety Confirmation**: Requires user confirmation before proceeding with restoration
- **Dry Run Mode**: Supports a `--dry-run` option to preview the restoration command without executing it
- **Environment Integration**: Automatically retrieves database credentials from the `.env` file

Usage:
```bash
# Restore from the latest backup file
python db/db_restore.py

# Restore from a specific backup file
python db/db_restore.py full_backup_2025-09-06.sql

# Preview restoration without executing (dry run)
python db/db_restore.py --dry-run

# Show help information
python db/db_restore.py --help
```

> **Warning**: Database restoration will overwrite existing data. Always create a backup before performing a restore operation.

## Database Web GUI

The server provides a web-based GUI for easy database exploration and management:

### db/db_web_gui.py

`db/db_web_gui.py` is a web-based query executor for PostgreSQL databases. This tool allows you to:

- View database table list
- Execute SQL queries
- View query results in tabular format
- Export query results to CSV
- Visualize data with basic charts

#### Execution Method

```bash
pip3 install pandas matplotlib flask 
python3 db/db_web_gui.py
```

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