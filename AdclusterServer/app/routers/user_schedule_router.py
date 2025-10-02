from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, date
from app.core.database import get_db
from app.schemas.user_schedule import UserScheduleCreate, UserScheduleUpdate, UserSchedule
from app.models.user_schedule import UserSchedule as UserScheduleModel
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/user-schedules", tags=["user schedules"])

# 일정 생성
@router.post("/", response_model=UserSchedule)
async def create_user_schedule(
    schedule: UserScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """새로운 사용자 일정을 생성합니다."""
    try:
        # 새 일정 생성
        db_schedule = UserScheduleModel(**schedule.dict())
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        
        # Pydantic 모델로 변환하여 반환
        return UserSchedule.from_orm(db_schedule)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"일정 생성 실패: {str(e)}")

# 일정 목록 조회 (월별/주별/날짜 범위)
@router.get("/", response_model=List[UserSchedule])
async def get_user_schedules(
    user_id: int = Query(..., description="사용자 ID"),
    start_date: Optional[str] = Query(None, description="시작 날짜 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="종료 날짜 (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="일정 카테고리"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """사용자의 일정 목록을 조회합니다."""
    try:
        # 기본 쿼리 (삭제되지 않은 일정만)
        query = db.query(UserScheduleModel).filter(
            and_(
                UserScheduleModel.us_userid == user_id,
                UserScheduleModel.us_isdeleted == False
            )
        )
        
        # 날짜 범위 필터링
        if start_date and end_date:
            try:
                start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
                end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
                
                # 일정이 지정된 범위와 겹치는 경우를 모두 포함
                query = query.filter(
                    or_(
                        # 시작일이 범위 내에 있는 경우
                        and_(
                            UserScheduleModel.us_startday >= start_dt,
                            UserScheduleModel.us_startday <= end_dt
                        ),
                        # 종료일이 범위 내에 있는 경우
                        and_(
                            UserScheduleModel.us_endday >= start_dt,
                            UserScheduleModel.us_endday <= end_dt
                        ),
                        # 일정이 범위를 완전히 포함하는 경우
                        and_(
                            UserScheduleModel.us_startday <= start_dt,
                            UserScheduleModel.us_endday >= end_dt
                        )
                    )
                )
            except ValueError:
                raise HTTPException(status_code=400, detail="잘못된 날짜 형식입니다. YYYY-MM-DD 형식을 사용하세요.")
        
        # 카테고리 필터링
        if category:
            query = query.filter(UserScheduleModel.us_category == category)
        
        # 시작일 기준으로 정렬
        schedules = query.order_by(UserScheduleModel.us_startday, UserScheduleModel.us_starttime).all()
        
        return schedules
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일정 조회 실패: {str(e)}")

# 특정 일정 조회
@router.get("/{schedule_id}", response_model=UserSchedule)
async def get_user_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """특정 일정의 상세 정보를 조회합니다."""
    schedule = db.query(UserScheduleModel).filter(
        and_(
            UserScheduleModel.us_id == schedule_id,
            UserScheduleModel.us_isdeleted == False
        )
    ).first()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
    
    return schedule

# 일정 수정
@router.put("/{schedule_id}", response_model=UserSchedule)
async def update_user_schedule(
    schedule_id: int,
    schedule_update: UserScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """기존 일정을 수정합니다."""
    try:
        # 기존 일정 조회
        db_schedule = db.query(UserScheduleModel).filter(
            and_(
                UserScheduleModel.us_id == schedule_id,
                UserScheduleModel.us_isdeleted == False
            )
        ).first()
        
        if not db_schedule:
            raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
        
        # 수정할 필드만 업데이트
        update_data = schedule_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_schedule, field, value)
        
        # 수정 시각 업데이트
        db_schedule.us_updatedat = func.current_timestamp()
        
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"일정 수정 실패: {str(e)}")

# 일정 삭제 (소프트 삭제)
@router.delete("/{schedule_id}")
async def delete_user_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """일정을 삭제합니다 (소프트 삭제)."""
    try:
        # 기존 일정 조회
        db_schedule = db.query(UserScheduleModel).filter(
            and_(
                UserScheduleModel.us_id == schedule_id,
                UserScheduleModel.us_isdeleted == False
            )
        ).first()
        
        if not db_schedule:
            raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다.")
        
        # 소프트 삭제 처리
        db_schedule.us_isdeleted = True
        db_schedule.us_deletedat = func.current_timestamp()
        db_schedule.us_updatedat = func.current_timestamp()
        
        db.commit()
        return {"message": "일정이 성공적으로 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"일정 삭제 실패: {str(e)}")

# 오늘의 일정 조회 (반복 일정 포함)
@router.get("/today/{user_id}", response_model=List[UserSchedule])
async def get_today_schedules(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """오늘의 일정을 조회합니다 (반복 일정 포함)."""
    try:
        today = date.today()
        
        # 오늘 해당하는 일정 조회 (단일 일정 + 반복 일정 후보)
        schedules = db.query(UserScheduleModel).filter(
            and_(
                UserScheduleModel.us_userid == user_id,
                UserScheduleModel.us_isdeleted == False,
                or_(
                    # 단일 일정 (오늘 포함)
                    and_(
                        UserScheduleModel.us_isrecurring == False,
                        or_(
                            and_(
                                UserScheduleModel.us_startday <= today,
                                UserScheduleModel.us_endday >= today
                            ),
                            UserScheduleModel.us_startday == today,
                            UserScheduleModel.us_endday == today
                        )
                    ),
                    # 반복 일정 후보 (오늘 발생 가능)
                    and_(
                        UserScheduleModel.us_isrecurring == True,
                        UserScheduleModel.us_startday <= today,
                        or_(
                            UserScheduleModel.us_recurrenceenddate.is_(None),
                            UserScheduleModel.us_recurrenceenddate >= today
                        )
                    )
                )
            )
        ).order_by(UserScheduleModel.us_starttime).all()
        
        # TODO: 반복 일정의 실제 오늘 발생 여부는 RRULE 라이브러리로 처리 필요
        # 현재는 후보만 반환
        
        return schedules
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"오늘 일정 조회 실패: {str(e)}")