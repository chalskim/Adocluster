// ENUM 정의
export enum RecurrencePattern {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  NONE = "NONE"
}

export enum ScheduleCategory {
  WORK = "WORK",
  PERSONAL = "PERSONAL",
  MEETING = "MEETING",
  DEADLINE = "DEADLINE",
  OTHER = "OTHER"
}

// 기본 사용자 일정 인터페이스
export interface UserScheduleBase {
  us_title: string;
  us_description?: string;
  us_startday: string; // YYYY-MM-DD date string (필수)
  us_endday: string;   // YYYY-MM-DD date string (필수)
  us_category: ScheduleCategory; // 필수
  us_starttime?: string; // HH:MM:SS time string
  us_endtime?: string;   // HH:MM:SS time string
  us_location?: string;
  us_attendees?: string;
  us_remindersettings?: Record<string, any>;
  us_color?: string;
  us_isrecurring: boolean; // 필수
  us_recurrencepattern?: RecurrencePattern;
  us_recurrenceenddate?: string; // YYYY-MM-DD date string
}

// 일정 생성용 인터페이스
export interface UserScheduleCreate extends UserScheduleBase {
  us_userid: number; // 필수
}

// 일정 수정용 인터페이스 (모든 필드 선택적)
export interface UserScheduleUpdate {
  us_title?: string;
  us_description?: string;
  us_startday?: string;
  us_endday?: string;
  us_category?: ScheduleCategory;
  us_starttime?: string;
  us_endtime?: string;
  us_location?: string;
  us_attendees?: string;
  us_remindersettings?: Record<string, any>;
  us_color?: string;
  us_isrecurring?: boolean;
  us_recurrencepattern?: RecurrencePattern;
  us_recurrenceenddate?: string;
}

// 완전한 사용자 일정 인터페이스 (DB에서 반환되는 형태)
export interface UserSchedule extends UserScheduleBase {
  us_id: number;
  us_userid: number;
  us_createdat: string; // ISO datetime string
  us_updatedat: string; // ISO datetime string
  us_deletedat?: string; // ISO datetime string
  us_isdeleted: boolean;
}

// API 응답용 타입
export interface UserScheduleResponse {
  data: UserSchedule[];
  total?: number;
  page?: number;
  limit?: number;
}

// 일정 조회 필터 옵션
export interface UserScheduleFilters {
  user_id: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  category?: ScheduleCategory;
}

// 캘린더 이벤트 변환용 인터페이스
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category: ScheduleCategory;
  color?: string;
  description?: string;
  location?: string;
  attendees?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}
