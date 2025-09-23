from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
from app.models.folder import Folder as FolderModel
from app.schemas.folder import FolderCreate, FolderUpdate, FolderResponse, FolderTreeResponse
import uuid

router = APIRouter(
    prefix="/api/folders",
    tags=["folders"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder: FolderCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new folder"""
    try:
        # Check if project exists and user has access
        project = db.query(ProjectModel).filter(ProjectModel.prjid == folder.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="프로젝트를 찾을 수 없습니다."
            )
        
        # Check if parent folder exists (if specified)
        if folder.parent_id:
            parent_folder = db.query(FolderModel).filter(
                and_(
                    FolderModel.id == folder.parent_id,
                    FolderModel.project_id == folder.project_id,
                    FolderModel.is_active == True
                )
            ).first()
            if not parent_folder:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="상위 폴더를 찾을 수 없습니다."
                )
        
        # Create new folder
        db_folder = FolderModel(
            name=folder.name,
            description=folder.description,
            project_id=folder.project_id,
            parent_id=folder.parent_id,
            created_by=current_user.uid
        )
        
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        
        return db_folder
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 생성 중 오류 발생: {str(e)}"
        )

@router.get("/project/{project_id}", response_model=List[FolderTreeResponse])
async def get_project_folders(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all folders for a project in tree structure"""
    try:
        # Check if project exists and user has access
        project = db.query(ProjectModel).filter(ProjectModel.prjid == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="프로젝트를 찾을 수 없습니다."
            )
        
        # Get all folders for the project
        folders = db.query(FolderModel).filter(
            and_(
                FolderModel.project_id == project_id,
                FolderModel.is_active == True
            )
        ).order_by(FolderModel.name).all()
        
        # Build tree structure
        folder_dict = {folder.id: folder for folder in folders}
        root_folders = []
        
        for folder in folders:
            folder_response = FolderTreeResponse.model_validate(folder)
            folder_response.children = []
            
            if folder.parent_id is None:
                root_folders.append(folder_response)
            else:
                parent = folder_dict.get(folder.parent_id)
                if parent:
                    # Find parent in the response structure
                    parent_response = next(
                        (f for f in root_folders if f.id == parent.id), 
                        None
                    )
                    if parent_response:
                        parent_response.children.append(folder_response)
        
        return root_folders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 조회 중 오류 발생: {str(e)}"
        )

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: uuid.UUID,
    folder_update: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a folder"""
    try:
        # Get folder
        db_folder = db.query(FolderModel).filter(
            and_(
                FolderModel.id == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if not db_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="폴더를 찾을 수 없습니다."
            )
        
        # Check if parent folder exists (if specified)
        if folder_update.parent_id:
            parent_folder = db.query(FolderModel).filter(
                and_(
                    FolderModel.id == folder_update.parent_id,
                    FolderModel.project_id == db_folder.project_id,
                    FolderModel.is_active == True
                )
            ).first()
            if not parent_folder:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="상위 폴더를 찾을 수 없습니다."
                )
            
            # Check for circular reference
            if folder_update.parent_id == folder_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="폴더를 자기 자신의 하위 폴더로 설정할 수 없습니다."
                )
        
        # Update folder
        update_data = folder_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_folder, field, value)
        
        db.commit()
        db.refresh(db_folder)
        
        return db_folder
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 수정 중 오류 발생: {str(e)}"
        )

@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a folder (soft delete)"""
    try:
        # Get folder
        db_folder = db.query(FolderModel).filter(
            and_(
                FolderModel.id == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if not db_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="폴더를 찾을 수 없습니다."
            )
        
        # Check if folder has children
        children = db.query(FolderModel).filter(
            and_(
                FolderModel.parent_id == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if children:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="하위 폴더가 있는 폴더는 삭제할 수 없습니다. 먼저 하위 폴더를 삭제하거나 이동하세요."
            )
        
        # Soft delete
        db_folder.is_active = False
        db.commit()
        
        return {"message": "폴더가 성공적으로 삭제되었습니다."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 삭제 중 오류 발생: {str(e)}"
        )

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific folder"""
    try:
        folder = db.query(FolderModel).filter(
            and_(
                FolderModel.id == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="폴더를 찾을 수 없습니다."
            )
        
        return folder
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 조회 중 오류 발생: {str(e)}"
        )