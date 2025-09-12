from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
from app.schemas.project import ProjectCreate, ProjectResponse
from datetime import date
import uuid

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new project"""
    try:
        # Create new project
        db_project = ProjectModel(
            prjid=uuid.uuid4(),
            crtid=current_user.uid,  # Use the current user's ID as creator
            title=project.title,
            description=project.description,
            visibility=project.visibility,
            start_date=project.start_date,
            end_date=project.end_date
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        return db_project
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로젝트 생성 중 오류 발생: {str(e)}"
        )

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all projects for the current user"""
    try:
        projects = db.query(ProjectModel).filter(ProjectModel.crtid == current_user.uid).offset(skip).limit(limit).all()
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로젝트 목록 조회 중 오류 발생: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific project by ID"""
    try:
        project = db.query(ProjectModel).filter(
            ProjectModel.prjid == uuid.UUID(project_id),
            ProjectModel.crtid == current_user.uid
        ).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="프로젝트를 찾을 수 없습니다"
            )
            
        return project
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 프로젝트 ID 형식입니다"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로젝트 조회 중 오류 발생: {str(e)}"
        )