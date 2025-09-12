# app/routers/uploads_router.py
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional, List
import os
import shutil
import uuid

router = APIRouter()

# Define upload directories
UPLOAD_BASE_DIR = "uploads"
IMAGE_DIR = os.path.join(UPLOAD_BASE_DIR, "images")
DOCUMENTS_DIR = os.path.join(UPLOAD_BASE_DIR, "documents")
FILES_DIR = os.path.join(UPLOAD_BASE_DIR, "files")
# Create directories if they don't exist
os.makedirs(UPLOAD_BASE_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(FILES_DIR, exist_ok=True)

# Define file extensions
IMAGE_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'
}

DOCUMENT_EXTENSIONS = {
    '.txt', '.text',
    '.doc', '.docx', '.dot', '.dotx',
    '.xls', '.xlsx', '.xlsm', '.xlsb',
    '.ppt', '.pptx',
    '.hwp', '.hwpx',
    '.pdf', '.rtf', '.odt', '.ods', '.odp'
}

def categorize_file(filename: str) -> str:
    """Determine the appropriate directory for a file based on its extension"""
    _, extension = os.path.splitext(filename.lower())
    
    if extension in IMAGE_EXTENSIONS:
        return IMAGE_DIR
    elif extension in DOCUMENT_EXTENSIONS:
        return DOCUMENTS_DIR
    else:
        return FILES_DIR

def get_file_content_type(file_path):
    print(f"--- uploads_router.py: Guessing content type for {file_path} ---")
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf': return 'application/pdf'
    if ext in ('.jpg', '.jpeg'): return 'image/jpeg'
    if ext == '.png': return 'image/png'
    if ext == '.gif': return 'image/gif'
    if ext == '.bmp': return 'image/bmp'
    if ext == '.webp': return 'image/webp'
    if ext == '.txt': return 'text/plain'
    if ext == '.html': return 'text/html'
    if ext == '.json': return 'application/json'
    if ext == '.xml': return 'application/xml'
    if ext == '.zip': return 'application/zip'
    if ext in ('.doc', '.docx'): return 'application/msword'
    if ext in ('.xls', '.xlsx'): return 'application/vnd.ms-excel'
    if ext in ('.ppt', '.pptx'): return 'application/vnd.ms-powerpoint'
    if ext in ('.hwp', '.hwpx'): return 'application/x-hwp'  # HWP file types
    print(f"--- uploads_router.py: Fallback content type for {file_path} ---")
    return 'application/octet-stream' # Default

@router.post("/upload")
async def upload_single_file(file: UploadFile = File(...), description: Optional[str] = None):
    print(f"--- uploads_router.py: POST /api/upload - Received single file upload request for: {file.filename} ---")
    try:
        # Determine the appropriate directory based on file extension
        target_directory = categorize_file(file.filename)
        
        if not os.path.exists(target_directory):
            print(f"--- uploads_router.py: Creating target directory: {target_directory} ---")
            os.makedirs(target_directory, exist_ok=True)
        
        # Generate a unique filename to prevent conflicts
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = Path(target_directory) / unique_filename
        
        print(f"--- uploads_router.py: Saving single file to: {file_path} ---")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        content_type = get_file_content_type(str(file_path))
        
        # Determine the relative path for the response
        relative_path = os.path.relpath(target_directory, UPLOAD_BASE_DIR)
        if relative_path == ".":
            file_response_path = f"uploads/{unique_filename}"
        else:
            file_response_path = f"uploads/{relative_path}/{unique_filename}"

        print(f"--- uploads_router.py: Successfully uploaded single file: {unique_filename}, size: {file_size} bytes ---")
        return {
            "filename": unique_filename, 
            "original_filename": file.filename,
            "detail": "File uploaded successfully",
            "size": file_size,
            "path": file_response_path, 
            "content_type": content_type,
            "description": description if description else "N/A"
        }
    except Exception as e:
        print(f"--- uploads_router.py: ERROR during single file upload for {file.filename}: {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")

@router.post("/upload/multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...), description: Optional[str] = None):
    print(f"--- uploads_router.py: POST /api/upload/multiple - Received multiple file upload request for {len(files)} files. ---")
    uploaded_files_info = []
    
    for file_item in files: # file 변수명 충돌을 피하기 위해 file_item으로 변경
        print(f"--- uploads_router.py: Processing file_item: {file_item.filename} ---")
        try:
            # Determine the appropriate directory based on file extension
            target_directory = categorize_file(file_item.filename)
            
            if not os.path.exists(target_directory):
                print(f"--- uploads_router.py: Creating target directory: {target_directory} ---")
                os.makedirs(target_directory, exist_ok=True)
            
            # Generate a unique filename to prevent conflicts
            file_extension = os.path.splitext(file_item.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = Path(target_directory) / unique_filename
            
            print(f"--- uploads_router.py: Saving multiple file part to: {file_path} ---")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file_item.file, buffer)
            
            file_size = os.path.getsize(file_path)
            content_type = get_file_content_type(str(file_path))
            
            # Determine the relative path for the response
            relative_path = os.path.relpath(target_directory, UPLOAD_BASE_DIR)
            if relative_path == ".":
                file_response_path = f"uploads/{unique_filename}"
            else:
                file_response_path = f"uploads/{relative_path}/{unique_filename}"

            uploaded_files_info.append({
                "filename": unique_filename,
                "original_filename": file_item.filename,
                "detail": "File uploaded successfully",
                "size": file_size,
                "path": file_response_path,
                "content_type": content_type,
                "description": description if description else "N/A"
            })
            print(f"--- uploads_router.py: Successfully uploaded file part: {unique_filename} ---")
        except Exception as e:
            print(f"--- uploads_router.py: ERROR during multiple file upload for {file_item.filename}: {e} ---")
            uploaded_files_info.append({
                "filename": file_item.filename,
                "detail": f"Failed to upload: {e}",
                "status": "failed"
            })

    if not uploaded_files_info:
        print("--- uploads_router.py: ERROR - No files were successfully uploaded in a multiple file request. ---")
        raise HTTPException(status_code=500, detail="No files were successfully uploaded.")
    
    print(f"--- uploads_router.py: Processed {len(uploaded_files_info)} files in multiple upload request. ---")
    return {"files": uploaded_files_info, "message": "Multiple files processed."}


@router.get("/files")
async def list_files():
    print("--- uploads_router.py: GET /api/files - Received request to list uploaded files. ---")
    try:
        files_info = []
        
        # Walk through all subdirectories of UPLOAD_BASE_DIR
        for root, dirs, filenames in os.walk(UPLOAD_BASE_DIR):
            for filename in filenames:
                try:
                    file_path = os.path.join(root, filename)
                    file_size = os.path.getsize(file_path)
                    
                    # Get the relative path from UPLOAD_BASE_DIR
                    relative_path = os.path.relpath(file_path, UPLOAD_BASE_DIR)
                    
                    files_info.append({
                        "filename": filename,
                        "size": file_size,
                        "path": f"uploads/{relative_path}", 
                        "content_type": get_file_content_type(file_path),
                        "description": "N/A"
                    })
                    print(f"--- uploads_router.py: Added {filename} to list. ---")
                except Exception as e:
                    print(f"--- uploads_router.py: WARNING - Error getting info for file {filename}: {e} ---")
        
        print(f"--- uploads_router.py: Returning list of {len(files_info)} files. ---")
        return {"files": files_info}
    except Exception as e:
        print(f"--- uploads_router.py: ERROR listing files: {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to list files: {e}")

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    print(f"--- uploads_router.py: DELETE /api/files/{filename} - Received request to delete file: {filename} ---")
    sanitized_filename = Path(filename).name
    
    # Search for the file in all subdirectories
    file_path = None
    for root, dirs, filenames in os.walk(UPLOAD_BASE_DIR):
        if sanitized_filename in filenames:
            file_path = os.path.join(root, sanitized_filename)
            break
    
    if not file_path or not os.path.exists(file_path):
        print(f"--- uploads_router.py: ERROR - File to delete not found: {sanitized_filename} ---")
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        print(f"--- uploads_router.py: Deleting file: {file_path} ---")
        os.remove(file_path)
        print(f"--- uploads_router.py: Successfully deleted file: {sanitized_filename} ---")
        return {"detail": f"File '{sanitized_filename}' deleted successfully"}
    except Exception as e:
        print(f"--- uploads_router.py: ERROR deleting file '{sanitized_filename}': {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {e}")