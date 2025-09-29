from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.project_extended import ProjectExtendedResponse
from datetime import date, datetime
import uuid

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"],
    # 임시로 인증 제거 - 테스트용
    # dependencies=[Depends(get_current_user)],
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
        db_project = ProjectModel()
        db_project.prjid = uuid.uuid4()
        db_project.crtid = current_user.uid  # Use the current user's ID as creator
        db_project.title = project.title
        db_project.description = project.description
        db_project.visibility = project.visibility or 'team'
        db_project.start_date = project.start_date
        db_project.end_date = project.end_date
        
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

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update an existing project"""
    try:
        # Find the project
        db_project = db.query(ProjectModel).filter(
            ProjectModel.prjid == uuid.UUID(project_id),
            ProjectModel.crtid == current_user.uid
        ).first()
        
        if not db_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="프로젝트를 찾을 수 없습니다"
            )
        
        # Update fields that are provided
        update_data = project_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            # Map schema field names to model field names
            model_field_map = {
                'title': 'title',
                'description': 'description',
                'visibility': 'visibility',
                'start_date': 'start_date',
                'end_date': 'end_date'
            }
            
            if field in model_field_map:
                setattr(db_project, model_field_map[field], value)
        
        # Update the update_at timestamp
        db_project.update_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_project)
        
        return db_project
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="잘못된 프로젝트 ID 형식입니다"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로젝트 업데이트 중 오류 발생: {str(e)}"
        )

@router.get("/", response_model=List[ProjectExtendedResponse])
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # 임시로 인증 제거 - 테스트용
    # current_user: UserModel = Depends(get_current_user)
):
    """Get all projects with detailed information including notes and users count"""
    try:
        # 새로운 복잡한 JOIN 쿼리 실행
        query = """
        SELECT 
            p.prjid, 
            p.crtid, 
            u.uname, 
            p.title, 
            p.description, 
            p.start_date, 
            COALESCE(p.status, 'begin') AS status, 
            COUNT(DISTINCT n.noteid) AS notes, 
            COUNT(DISTINCT pu.uid) AS users 
        FROM projects p 
        JOIN users u 
           ON p.crtid = u.uid 
        LEFT JOIN pronote n 
            ON n.prjid = p.prjid 
        LEFT JOIN prjuser pu 
            ON pu.prjid = p.prjid 
        WHERE p.visibility IN ('company', 'team', 'private') 
          AND (p.end_date IS NULL OR p.end_date > CURRENT_DATE) 
        GROUP BY p.prjid, p.crtid, u.uname, p.title, p.description, p.start_date, COALESCE(p.status, 'begin')
        ORDER BY p.created_at DESC
        LIMIT :limit OFFSET :skip
        """
        
        result = db.execute(text(query), {"limit": limit, "skip": skip})
        projects = []
        
        for row in result:
            projects.append({
                "prjid": str(row.prjid),
                "crtid": str(row.crtid),
                "uname": row.uname,
                "title": row.title,
                "description": row.description,
                "start_date": row.start_date.isoformat() if row.start_date else None,
                "status": row.status,
                "notes": row.notes,
                "users": row.users
            })
        
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