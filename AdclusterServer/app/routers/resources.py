from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import uuid
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.my_lib import MyLib as MyLibModel
from app.models.my_lib_items import MyLibItem as MyLibItemModel
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse
import json

router = APIRouter(
    prefix="/api/resources",
    tags=["resources"],
    dependencies=[Depends(get_current_user)],
)

@router.get("/", response_model=List[ResourceResponse])
async def get_resources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all resources for the current user"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        # If no library exists, return empty list
        if not library:
            return []
        
        resources = db.query(MyLibItemModel).filter(
            MyLibItemModel.mlid == library.mlid
        ).offset(skip).limit(limit).all()
        
        return resources
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자료 목록 조회 중 오류 발생: {str(e)}"
        )

@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new resource"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        # If no library exists, create one
        if not library:
            library = MyLibModel(
                mlid=uuid.uuid4(),
                mltitle=f"{current_user.uname}의 자료실",
                type="personal",
                author=current_user.uname
            )
            db.add(library)
            db.commit()
            db.refresh(library)
        
        # Create the resource item
        db_resource = MyLibItemModel(
            item_id=uuid.uuid4(),
            mlid=library.mlid,
            item_type=resource.item_type,
            title=resource.title,
            url=resource.url,
            content=resource.content
        )
        
        db.add(db_resource)
        db.commit()
        db.refresh(db_resource)
        
        return db_resource
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자료 생성 중 오류 발생: {str(e)}"
        )

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific resource by ID"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        if not library:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        resource = db.query(MyLibItemModel).filter(
            MyLibItemModel.item_id == uuid.UUID(resource_id),
            MyLibItemModel.mlid == library.mlid
        ).first()
        
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
            
        return resource
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 자료 ID 형식입니다"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자료 조회 중 오류 발생: {str(e)}"
        )

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    resource_update: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a specific resource"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        if not library:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Find the resource
        db_resource = db.query(MyLibItemModel).filter(
            MyLibItemModel.item_id == uuid.UUID(resource_id),
            MyLibItemModel.mlid == library.mlid
        ).first()
        
        if not db_resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Update the resource fields
        if resource_update.item_type is not None:
            db_resource.item_type = resource_update.item_type
        if resource_update.title is not None:
            db_resource.title = resource_update.title
        if resource_update.url is not None:
            db_resource.url = resource_update.url
        if resource_update.content is not None:
            db_resource.content = resource_update.content
            
        db.commit()
        db.refresh(db_resource)
        
        return db_resource
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 자료 ID 형식입니다"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자료 수정 중 오류 발생: {str(e)}"
        )

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a specific resource"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        if not library:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Find the resource
        db_resource = db.query(MyLibItemModel).filter(
            MyLibItemModel.item_id == uuid.UUID(resource_id),
            MyLibItemModel.mlid == library.mlid
        ).first()
        
        if not db_resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Delete the resource
        db.delete(db_resource)
        db.commit()
        
        return None
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 자료 ID 형식입니다"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자료 삭제 중 오류 발생: {str(e)}"
        )

@router.post("/{resource_id}/upload")
async def upload_resource_file(
    resource_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Upload a file for a specific resource"""
    try:
        # First, check if the library exists for this user
        library = db.query(MyLibModel).filter(
            MyLibModel.author == current_user.uname
        ).first()
        
        if not library:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Find the resource
        db_resource = db.query(MyLibItemModel).filter(
            MyLibItemModel.item_id == uuid.UUID(resource_id),
            MyLibItemModel.mlid == library.mlid
        ).first()
        
        if not db_resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="자료를 찾을 수 없습니다"
            )
        
        # Save file to disk
        import os
        from pathlib import Path
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads/resources")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{resource_id}_{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update resource with file path
        content_dict = {}
        if db_resource.content:
            try:
                content_dict = json.loads(db_resource.content)
            except:
                content_dict = {"original_content": db_resource.content}
        
        content_dict["filePath"] = str(file_path)
        content_dict["fileName"] = file.filename
        content_dict["fileSize"] = len(content)
        content_dict["fileType"] = file.content_type
        
        db_resource.content = json.dumps(content_dict)
        db.commit()
        db.refresh(db_resource)
        
        return {"message": "파일이 성공적으로 업로드되었습니다", "resource": db_resource}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 자료 ID 형식입니다"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류 발생: {str(e)}"
        )