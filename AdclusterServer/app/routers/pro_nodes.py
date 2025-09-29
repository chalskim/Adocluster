from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.pro_nodes import ProNode
from app.models.user import User as UserModel
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/pro-nodes", tags=["pro-nodes"])

# Pydantic schemas
from pydantic import BaseModel
from datetime import datetime

class ProNodeBase(BaseModel):
    prjid: str
    prjid_parents: Optional[str] = None
    type: str = 'folder'
    title: str

class ProNodeCreate(ProNodeBase):
    pass

class ProNodeUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    prjid_parents: Optional[str] = None

class ProNodeResponse(ProNodeBase):
    nodeid: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/project/{project_id}", response_model=List[ProNodeResponse])
async def get_project_nodes(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get all nodes for a specific project"""
    try:
        nodes = db.query(ProNode).filter(
            ProNode.prjid == project_id
        ).order_by(ProNode.created_at).all()
        
        return nodes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노드 조회 중 오류 발생: {str(e)}"
        )

@router.get("/{node_id}", response_model=ProNodeResponse)
async def get_node(
    node_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific node by ID"""
    try:
        node = db.query(ProNode).filter(ProNode.nodeid == node_id).first()
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="노드를 찾을 수 없습니다"
            )
        return node
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노드 조회 중 오류 발생: {str(e)}"
        )

@router.post("/", response_model=ProNodeResponse, status_code=status.HTTP_201_CREATED)
async def create_node(
    node: ProNodeCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new node"""
    try:
        # Create new node
        db_node = ProNode(
            nodeid=uuid.uuid4(),
            prjid=uuid.UUID(node.prjid),
            prjid_parents=uuid.UUID(node.prjid_parents) if node.prjid_parents else None,
            type=node.type,
            title=node.title
        )
        
        db.add(db_node)
        db.commit()
        db.refresh(db_node)
        
        return db_node
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노드 생성 중 오류 발생: {str(e)}"
        )

@router.put("/{node_id}", response_model=ProNodeResponse)
async def update_node(
    node_id: str,
    node_update: ProNodeUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a node"""
    try:
        # Find the node
        node = db.query(ProNode).filter(ProNode.nodeid == node_id).first()
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="노드를 찾을 수 없습니다"
            )
        
        # Update fields
        if node_update.title is not None:
            node.title = node_update.title
        if node_update.type is not None:
            node.type = node_update.type
        if node_update.prjid_parents is not None:
            node.prjid_parents = uuid.UUID(node_update.prjid_parents) if node_update.prjid_parents else None
        
        node.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(node)
        
        return node
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노드 업데이트 중 오류 발생: {str(e)}"
        )

@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_node(
    node_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a node"""
    try:
        # Find the node
        node = db.query(ProNode).filter(ProNode.nodeid == node_id).first()
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="노드를 찾을 수 없습니다"
            )
        
        # Delete child nodes first (cascade delete)
        child_nodes = db.query(ProNode).filter(ProNode.prjid_parents == node_id).all()
        for child in child_nodes:
            db.delete(child)
        
        # Delete the node
        db.delete(node)
        db.commit()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"노드 삭제 중 오류 발생: {str(e)}"
        )

@router.get("/project/{project_id}/tree", response_model=List[ProNodeResponse])
async def get_project_tree(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get project nodes in tree structure"""
    try:
        nodes = db.query(ProNode).filter(
            ProNode.prjid == project_id
        ).order_by(ProNode.created_at).all()
        
        return nodes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"트리 조회 중 오류 발생: {str(e)}"
        )