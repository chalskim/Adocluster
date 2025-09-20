# ADOCluster Setup Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [New Features](#new-features)

## System Overview
ADOCluster is a full-stack web application designed to support collaborative project management and real-time communication. It consists of two main components: a backend API server and a frontend web interface.

## Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL
- Git

## Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd AdclusterServer
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv adcluster_env
   source adcluster_env/bin/activate  # On Windows: adcluster_env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your database configuration:
   ```env
   DB_HOST=localhost
   DB_NAME=adcluster
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_PORT=5432
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

## Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd adCluster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

## Database Setup
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE adcluster;
   ```

2. Apply initial migrations:
   ```bash
   cd AdclusterServer
   python apply_client_ips_migration.py
   python apply_mylib_migration.py  # Apply the new resource management schema
   ```

## Running the Application
1. Start the backend server:
   ```bash
   cd AdclusterServer
   source adcluster_env/bin/activate
   python main.py
   ```

2. Start the frontend server:
   ```bash
   cd adCluster
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## New Features

### Enhanced Resource Management (자료관리)
A new resource management system has been added to help users organize and manage various types of materials:

#### Key Features:
- **Multiple Resource Types**: Support for images, tables, formulas, videos, audio, websites, and citations
- **Folder-based Organization**: Organize resources in folders with rename capability
- **Comprehensive Management**: 
  - Images, videos, audio: Register, delete, download
  - Formulas, tables: Register, modify, delete, download
- **Rich Metadata**: Title, description, author, publisher, URL, DOI, ISBN, etc.
- **Automatic Information Extraction**: Extract basic file information automatically
- **Web Integration**: Save URL information and site images for web resources
- **Source Tracking**: Register source information for all resources
- **Note Integration**: Direct integration with the note editor for easy referencing

#### Access:
The new resource management feature can be accessed through the "자료관리(개선)" menu in the sidebar.

#### Technical Details:
- **Frontend**: React components in `/src/components/EnhancedResourceManagement/`
- **Backend**: FastAPI endpoints in `/app/routers/resources.py`
- **Database**: Updated schema in `migrations/20250920_update_mylib_schema.sql`
