from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
from typing import List
import uuid
from pathlib import Path

router = APIRouter()

# Define upload directories
UPLOAD_BASE_DIR = "uploads"
IMAGE_DIR = os.path.join(UPLOAD_BASE_DIR, "images")
DOCUMENT_DIR = os.path.join(UPLOAD_BASE_DIR, "documents")
VIDEO_DIR = os.path.join(UPLOAD_BASE_DIR, "videos")

# Create directories if they don't exist
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(DOCUMENT_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# Define allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"}

def get_file_type_and_directory(filename: str) -> tuple:
    """Determine file type and appropriate directory based on file extension"""
    _, extension = os.path.splitext(filename.lower())
    
    if extension in ALLOWED_IMAGE_EXTENSIONS:
        return "image", IMAGE_DIR
    elif extension in ALLOWED_DOCUMENT_EXTENSIONS:
        return "document", DOCUMENT_DIR
    elif extension in ALLOWED_VIDEO_EXTENSIONS:
        return "video", VIDEO_DIR
    else:
        return "other", UPLOAD_BASE_DIR

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: str = Form(None)
):
    """
    Upload a file to the appropriate directory based on its type.
    
    - **file**: The file to upload
    - **description**: Optional description of the file
    """
    try:
        # Determine file type and directory
        file_type, directory = get_file_type_and_directory(file.filename)
        
        # Generate a unique filename to prevent conflicts
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(directory, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded successfully",
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_type": file_type,
                "file_size": os.path.getsize(file_path),
                "description": description
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/upload/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    description: str = Form(None)
):
    """
    Upload multiple files to the appropriate directories based on their types.
    
    - **files**: The files to upload
    - **description**: Optional description for all files
    """
    uploaded_files = []
    
    for file in files:
        try:
            # Determine file type and directory
            file_type, directory = get_file_type_and_directory(file.filename)
            
            # Generate a unique filename to prevent conflicts
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(directory, unique_filename)
            
            # Save the file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append({
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_type": file_type,
                "file_size": os.path.getsize(file_path),
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file {file.filename}: {str(e)}")
    
    return JSONResponse(
        status_code=200,
        content={
            "message": f"Successfully uploaded {len(uploaded_files)} files",
            "files": uploaded_files,
            "description": description
        }
    )

@router.get("/files")
async def list_files():
    """List all uploaded files in a hierarchical structure"""
    def build_file_tree(base_path):
        tree = {}
        for root, dirs, files in os.walk(base_path):
            # Get relative path from base_path
            rel_path = os.path.relpath(root, base_path)
            if rel_path == ".":
                rel_path = ""
            
            # Navigate to the correct position in the tree
            current = tree
            if rel_path:
                for part in rel_path.split(os.sep):
                    if part not in current:
                        current[part] = {}
                    current = current[part]
            
            # Add files to current directory
            current_files = []
            for filename in files:
                if filename != "README.md":  # Skip the README file
                    file_path = os.path.join(root, filename)
                    file_stat = os.stat(file_path)
                    current_files.append({
                        "filename": filename,
                        "path": file_path,
                        "size": file_stat.st_size,
                        "modified": file_stat.st_mtime
                    })
            current["_files"] = current_files
        return tree
    
    file_tree = build_file_tree(UPLOAD_BASE_DIR)
    
    # Convert the tree to a list format for easier processing
    def convert_tree_to_list(tree, path=""):
        result = []
        for key, value in tree.items():
            if key == "_files":
                # Add files directly to the result
                result.extend(value)
            else:
                # This is a folder
                folder_path = os.path.join(path, key) if path else key
                folder_contents = convert_tree_to_list(value, folder_path)
                result.append({
                    "type": "folder",
                    "name": key,
                    "path": folder_path,
                    "contents": folder_contents
                })
        return result
    
    files = convert_tree_to_list(file_tree)
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "File structure retrieved successfully",
            "files": files
        }
    )

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """Delete a specific file"""
    # Search for the file in all directories
    file_path = None
    for root, _, filenames in os.walk(UPLOAD_BASE_DIR):
        if filename in filenames:
            file_path = os.path.join(root, filename)
            break
    
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return JSONResponse(
            status_code=200,
            content={
                "message": "File deleted successfully",
                "filename": filename
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

# Add a new endpoint to delete a file by its full path
@router.delete("/files/path/{file_path:path}")
async def delete_file_by_path(file_path: str):
    """Delete a specific file by its full path"""
    # Security check: ensure the path is within the uploads directory
    full_path = os.path.join(UPLOAD_BASE_DIR, file_path)
    full_path = os.path.normpath(full_path)
    
    # Ensure the path is within the uploads directory
    if not full_path.startswith(os.path.normpath(UPLOAD_BASE_DIR)):
        raise HTTPException(status_code=400, detail="Invalid file path")
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=400, detail="Path is not a file")
    
    try:
        os.remove(full_path)
        return JSONResponse(
            status_code=200,
            content={
                "message": "File deleted successfully",
                "file_path": file_path
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
