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
from datetime import datetime

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
        parent_folder = None
        parent_folder_id = None
        if folder.parent_id:
            # Convert string parent_id to integer
            try:
                parent_folder_id = int(folder.parent_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="상위 폴더 ID는 정수여야 합니다."
                )
            
            parent_folder = db.query(FolderModel).filter(
                and_(
                    FolderModel.folderid == parent_folder_id,
                    FolderModel.projectid == folder.project_id,
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
            foldername=folder.name,
            folderdescription=folder.description,
            projectid=folder.project_id,
            creatorid=current_user.uid,
            parentfolderid=parent_folder_id,
            is_active=True
        )
        
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        
        # Return response with correct field mappings
        return FolderResponse(
            id=db_folder.folderid,
            name=db_folder.foldername,
            description=db_folder.folderdescription,
            project_id=str(db_folder.projectid),
            parent_id=db_folder.parentfolderid,
            created_by=str(db_folder.creatorid),
            is_active=db_folder.is_active,
            created_at=db_folder.foldercreated,
            updated_at=db_folder.folderupdated
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 생성 중 오류 발생: {str(e)}"
        )

@router.get("/project/{project_id}", response_model=List[FolderTreeResponse])
async def get_project_folders(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all folders for a project in tree structure"""
    try:
        # Convert project_id string to UUID
        try:
            project_uuid = uuid.UUID(project_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="프로젝트 ID는 유효한 UUID 형식이어야 합니다."
            )
        
        # Check if project exists and user has access
        project = db.query(ProjectModel).filter(ProjectModel.prjid == project_uuid).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="프로젝트를 찾을 수 없습니다."
            )
        
        # Get all folders for the project
        folders = db.query(FolderModel).filter(
            and_(
                FolderModel.projectid == project_uuid,
                FolderModel.is_active == True
            )
        ).order_by(FolderModel.foldername).all()
        
        # Build tree structure
        # Create a dictionary to hold all folder responses
        folder_dict = {}
        root_folders = []
        
        # First pass: create all folder responses
        for folder in folders:
            folder_response = FolderTreeResponse(
                id=folder.folderid,
                name=folder.foldername,
                description=folder.folderdescription,
                project_id=str(folder.projectid),
                parent_id=folder.parentfolderid,
                created_by=str(folder.creatorid),
                is_active=folder.is_active,
                created_at=folder.foldercreated,
                updated_at=folder.folderupdated,
                children=[]
            )
            folder_dict[folder.folderid] = folder_response
            
        # Second pass: build the tree structure
        for folder in folders:
            folder_response = folder_dict[folder.folderid]
            if folder.parentfolderid is None:
                # Root folder
                root_folders.append(folder_response)
            else:
                # Child folder - add to parent's children list
                if folder.parentfolderid in folder_dict:
                    parent_response = folder_dict[folder.parentfolderid]
                    parent_response.children.append(folder_response)
        
        return root_folders
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 조회 중 오류 발생: {str(e)}"
        )

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_update: FolderUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a folder"""
    try:
        # Get folder
        db_folder = db.query(FolderModel).filter(
            and_(
                FolderModel.folderid == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if not db_folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="폴더를 찾을 수 없습니다."
            )
        
        # Check if parent folder exists (if specified)
        parent_folder_id = None
        if folder_update.parent_id:
            # Convert string parent_id to integer
            try:
                parent_folder_id = int(folder_update.parent_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="상위 폴더 ID는 정수여야 합니다."
                )
            
            parent_folder = db.query(FolderModel).filter(
                and_(
                    FolderModel.folderid == parent_folder_id,
                    FolderModel.projectid == db_folder.projectid,
                    FolderModel.is_active == True
                )
            ).first()
            if not parent_folder:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="상위 폴더를 찾을 수 없습니다."
                )
            
            # Check for circular reference
            if parent_folder_id == folder_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="폴더를 자기 자신의 하위 폴더로 설정할 수 없습니다."
                )
        
        # Update folder
        if folder_update.name is not None:
            db_folder.foldername = folder_update.name
        if folder_update.description is not None:
            db_folder.folderdescription = folder_update.description
        if folder_update.parent_id is not None:
            db_folder.parentfolderid = parent_folder_id
        
        db_folder.folderupdated = datetime.utcnow()
        
        db.commit()
        db.refresh(db_folder)
        
        # Return response with correct field mappings
        return FolderResponse(
            id=db_folder.folderid,
            name=db_folder.foldername,
            description=db_folder.folderdescription,
            project_id=str(db_folder.projectid),
            parent_id=db_folder.parentfolderid,
            created_by=str(db_folder.creatorid),
            is_active=db_folder.is_active,
            created_at=db_folder.foldercreated,
            updated_at=db_folder.folderupdated
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 수정 중 오류 발생: {str(e)}"
        )

@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a folder (soft delete)"""
    try:
        # Get folder
        db_folder = db.query(FolderModel).filter(
            and_(
                FolderModel.folderid == folder_id,
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
                FolderModel.parentfolderid == folder_id,
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
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific folder"""
    try:
        folder = db.query(FolderModel).filter(
            and_(
                FolderModel.folderid == folder_id,
                FolderModel.is_active == True
            )
        ).first()
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="폴더를 찾을 수 없습니다."
            )
        
        # Return response with correct field mappings
        return FolderResponse(
            id=folder.folderid,
            name=folder.foldername,
            description=folder.folderdescription,
            project_id=folder.projectid,
            parent_id=folder.parentfolderid,
            created_by=folder.creatorid,
            is_active=folder.is_active,
            created_at=folder.foldercreated,
            updated_at=folder.folderupdated
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"폴더 조회 중 오류 발생: {str(e)}"
        )