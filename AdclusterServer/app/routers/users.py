from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user import User, UserCreate, UserUpdate
from app.models.user import User as UserModel
from app.core.database import get_db
from app.core.security import get_password_hash
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """Get current user profile - protected endpoint"""
    return current_user

@router.get("/", response_model=List[User])
async def read_users(skip: int = 0, limit: int = 100, full_permission: int = 0, db: Session = Depends(get_db)):
    # 임시로 인증 제거 - 테스트용
    # current_user: UserModel = Depends(get_current_user)
    # 전체 권한 설정 시 모든 사용자를 가져옴
    if full_permission == 1:
        users = db.query(UserModel).all()
    else:
        users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=User)
async def read_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.uid == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    existing_user = db.query(UserModel).filter(UserModel.uemail == user.uemail).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="이미 등록된 이메일 주소입니다."
        )
    
    # Hash the password before storing
    hashed_password = get_password_hash(user.upassword)
    
    # Create user with hashed password
    db_user = UserModel(
        uemail=user.uemail,
        urole=user.urole,
        uname=user.uname,
        uavatar=user.uavatar,
        uisdel=user.uisdel,
        uactive=user.uactive,
        upassword=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/update-profile", response_model=User)
async def update_user_profile(user_update: UserUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Update current user profile - protected endpoint"""
    # Get the current user from the database to ensure we have the latest data
    db_user = db.query(UserModel).filter(UserModel.uid == current_user.uid).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # Update user name if provided
    if user_update.uname is not None:
        db_user.uname = user_update.uname
    
    # Update password if provided
    if user_update.upassword is not None and user_update.upassword != "":
        db_user.upassword = get_password_hash(user_update.upassword)
    
    # Update avatar if provided
    if user_update.uavatar is not None:
        db_user.uavatar = user_update.uavatar
    
    # Update the updated_at timestamp
    from datetime import datetime
    db_user.uupdated_at = datetime.utcnow()
    
    # Commit changes to the database
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/{user_id}/block", response_model=User)
async def block_user(user_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Block a user - admin only endpoint"""
    # Check if current user is admin
    if current_user.urole != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 이 작업을 수행할 수 있습니다."
        )
    
    # Get the user to block
    db_user = db.query(UserModel).filter(UserModel.uid == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # Update user active status to False (blocked)
    db_user.uactive = False
    
    # Update the updated_at timestamp
    from datetime import datetime
    db_user.uupdated_at = datetime.utcnow()
    
    # Commit changes to the database
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/{user_id}/unblock", response_model=User)
async def unblock_user(user_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Unblock a user - admin only endpoint"""
    # Check if current user is admin
    if current_user.urole != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 이 작업을 수행할 수 있습니다."
        )
    
    # Get the user to unblock
    db_user = db.query(UserModel).filter(UserModel.uid == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # Update user active status to True (unblocked)
    db_user.uactive = True
    
    # Update the updated_at timestamp
    from datetime import datetime
    db_user.uupdated_at = datetime.utcnow()
    
    # Commit changes to the database
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/{user_id}/delete", response_model=User)
async def delete_user(user_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Soft delete a user - admin only endpoint"""
    # Check if current user is admin
    if current_user.urole != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 이 작업을 수행할 수 있습니다."
        )
    
    # Get the user to delete
    db_user = db.query(UserModel).filter(UserModel.uid == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # Soft delete by setting uisdel to True
    db_user.uisdel = True
    
    # Update the updated_at timestamp
    from datetime import datetime
    db_user.uupdated_at = datetime.utcnow()
    
    # Commit changes to the database
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/{user_id}/role", response_model=User)
async def update_user_role(user_id: str, role: str, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Update user role - admin only endpoint"""
    # Check if current user is admin
    if current_user.urole != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 이 작업을 수행할 수 있습니다."
        )
    
    # Validate role
    valid_roles = ["user", "admin", "viewer"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"유효하지 않은 역할입니다. 유효한 역할: {', '.join(valid_roles)}"
        )
    
    # Get the user to update
    db_user = db.query(UserModel).filter(UserModel.uid == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # Update user role
    db_user.urole = role
    
    # Update the updated_at timestamp
    from datetime import datetime
    db_user.uupdated_at = datetime.utcnow()
    
    # Commit changes to the database
    db.commit()
    db.refresh(db_user)
    
    return db_user