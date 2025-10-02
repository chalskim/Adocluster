from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime
from enum import Enum
from uuid import UUID

# ENUM 타입 정의
class RecurrencePattern(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"
    NONE = "NONE"

class ScheduleCategory(str, Enum):
    WORK = "WORK"
    PERSONAL = "PERSONAL"
    MEETING = "MEETING"
    DEADLINE = "DEADLINE"
    OTHER = "OTHER"

# 기본 UserSchedule 스키마
class UserScheduleBase(BaseModel):
    us_title: str = Field(..., max_length=255, description="일정 제목")
    us_description: Optional[str] = Field(None, description="일정 설명")
    us_startday: Optional[date] = Field(None, description="일정 시작 날짜")
    us_endday: Optional[date] = Field(None, description="일정 종료 날짜")
    us_category: Optional[ScheduleCategory] = Field(None, description="일정 종류")
    us_starttime: Optional[time] = Field(None, description="일정 시작 시간")
    us_endtime: Optional[time] = Field(None, description="일정 종료 시간")
    us_location: Optional[str] = Field(None, description="일정 장소")
    us_attendees: Optional[str] = Field(None, description="참석자 목록")
    us_remindersettings: Optional[dict] = Field(None, description="알림 설정(JSON)")
    us_color: Optional[str] = Field(None, description="사용자 지정색상")
    
    # 반복 일정 관련
    us_isrecurring: bool = Field(False, description="반복 여부")
    us_recurrencepattern: Optional[RecurrencePattern] = Field(None, description="반복 패턴")
    us_recurrenceenddate: Optional[date] = Field(None, description="반복 종료일")

# 일정 생성용 스키마
class UserScheduleCreate(UserScheduleBase):
    us_userid: int = Field(..., description="사용자 ID")

# 일정 수정용 스키마
class UserScheduleUpdate(BaseModel):
    us_title: Optional[str] = Field(None, max_length=255, description="일정 제목")
    us_description: Optional[str] = Field(None, description="일정 설명")
    us_startday: Optional[date] = Field(None, description="일정 시작 날짜")
    us_endday: Optional[date] = Field(None, description="일정 종료 날짜")
    us_category: Optional[ScheduleCategory] = Field(None, description="일정 종류")
    us_starttime: Optional[time] = Field(None, description="일정 시작 시간")
    us_endtime: Optional[time] = Field(None, description="일정 종료 시간")
    us_location: Optional[str] = Field(None, description="일정 장소")
    us_attendees: Optional[str] = Field(None, description="참석자 목록")
    us_remindersettings: Optional[dict] = Field(None, description="알림 설정(JSON)")
    us_color: Optional[str] = Field(None, description="사용자 지정색상")
    
    # 반복 일정 관련
    us_isrecurring: Optional[bool] = Field(None, description="반복 여부")
    us_recurrencepattern: Optional[RecurrencePattern] = Field(None, description="반복 패턴")
    us_recurrenceenddate: Optional[date] = Field(None, description="반복 종료일")

# 일정 응답용 스키마
class UserSchedule(UserScheduleBase):
    us_id: int = Field(..., description="일정 고유 ID")
    us_userid: int = Field(..., description="사용자 ID")
    us_createdat: datetime = Field(..., description="생성 시각")
    us_updatedat: datetime = Field(..., description="수정 시각")
    us_deletedat: Optional[datetime] = Field(None, description="삭제 시각")
    us_isdeleted: bool = Field(False, description="삭제 여부")

    class Config:
        from_attributes = True
        orm_mode = True
