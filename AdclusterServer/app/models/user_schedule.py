from sqlalchemy import Column, Integer, String, Text, Date, Time, Boolean, TIMESTAMP, JSON, func, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

# ENUM 타입 정의
RECURRENCE_PATTERN = ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NONE', name='recurrence_pattern')
SCHEDULE_CATEGORY = ENUM('WORK', 'PERSONAL', 'MEETING', 'DEADLINE', 'OTHER', name='schedule_category')

class UserSchedule(Base):
    __tablename__ = "user_schedules"
    
    us_id = Column(Integer, primary_key=True, autoincrement=True)  # 일정 고유 ID
    us_userid = Column(Integer, ForeignKey('users.uid'), nullable=False)  # 사용자 ID (Integer)
    us_title = Column(String(255), nullable=False)  # 일정 제목
    us_description = Column(Text)  # 일정 설명
    us_startday = Column(Date)  # 일정 시작 날짜
    us_endday = Column(Date)  # 일정 종료 날짜
    us_category = Column(SCHEDULE_CATEGORY)  # 일정 종류
    us_starttime = Column(Time)  # 일정 시작 시간
    us_endtime = Column(Time)  # 일정 종료 시간
    us_location = Column(String(255))  # 일정 장소
    us_attendees = Column(Text)  # 참석자 목록
    us_remindersettings = Column(JSON)  # 알림 설정(JSON)
    us_color = Column(String(7))  # 사용자 지정색상
    
    # 반복 일정 관련
    us_isrecurring = Column(Boolean, default=False)  # 반복 여부
    us_recurrencepattern = Column(RECURRENCE_PATTERN)  # 반복 패턴
    us_recurrenceenddate = Column(Date)  # 반복 종료일
    
    # 관리 필드
    us_createdat = Column(TIMESTAMP, default=func.current_timestamp())  # 생성 시각
    us_updatedat = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())  # 수정 시각
    us_deletedat = Column(TIMESTAMP)  # 삭제 시각
    us_isdeleted = Column(Boolean, default=False)  # 삭제 여부
    
    # Relationships
    user = relationship("User", back_populates="user_schedules")
    
    def __repr__(self):
        return f"<UserSchedule(us_id={self.us_id}, us_title='{self.us_title}', us_userid={self.us_userid})>"
    
    def to_dict(self):
        """모델을 딕셔너리로 변환하여 JSON 직렬화 문제 해결"""
        return {
            'us_id': self.us_id,
            'us_userid': self.us_userid,
            'us_title': self.us_title,
            'us_description': self.us_description,
            'us_startday': self.us_startday,
            'us_endday': self.us_endday,
            'us_category': self.us_category,
            'us_starttime': self.us_starttime,
            'us_endtime': self.us_endtime,
            'us_location': self.us_location,
            'us_attendees': self.us_attendees,
            'us_remindersettings': self.us_remindersettings,
            'us_color': self.us_color,
            'us_isrecurring': self.us_isrecurring,
            'us_recurrencepattern': self.us_recurrencepattern,
            'us_recurrenceenddate': self.us_recurrenceenddate,
            'us_createdat': self.us_createdat,
            'us_updatedat': self.us_updatedat,
            'us_deletedat': self.us_deletedat,
            'us_isdeleted': self.us_isdeleted
        }