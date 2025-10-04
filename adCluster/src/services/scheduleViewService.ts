import { CalendarEvent } from '../hooks/useCalendar';
import { ScheduleCategory } from '../types/UserScheduleTypes';
import { getAuthHeaders, getApiBaseUrl } from './api'; // Import the consistent auth headers function

const API_BASE_URL = `${getApiBaseUrl()}/api/schedule-views`;

// API 응답 타입 정의
interface ApiSchedule {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null;   // HH:MM:SS
  is_all_day: boolean;
  category: string;
  priority: string;
  location: string | null;
  color: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

// ApiSchedule을 CalendarEvent로 변환
const apiScheduleToCalendarEvent = (schedule: ApiSchedule): CalendarEvent => {
  return {
    us_id: parseInt(schedule.id),
    us_userid: schedule.user_id,
    us_title: schedule.title,
    us_description: schedule.description || undefined,
    us_startday: schedule.start_date,
    us_endday: schedule.end_date,
    us_starttime: schedule.start_time || undefined,
    us_endtime: schedule.end_time || undefined,
    isAllDay: schedule.is_all_day,
    us_category: schedule.category as ScheduleCategory,
    priority: schedule.priority as 'low' | 'medium' | 'high',
    us_color: schedule.color || undefined,
    us_location: schedule.location || undefined,
    us_attendees: undefined, // API에서 제공하지 않음
    us_remindersettings: undefined,
    us_isrecurring: false, // 기본값
    us_recurrencepattern: undefined,
    us_recurrenceenddate: undefined,
    us_createdat: schedule.created_at,
    us_updatedat: schedule.updated_at,
    us_deletedat: undefined,
    us_isdeleted: false
  };
};

// 월별 일정 조회
export const getMonthlySchedules = async (
  year: number,
  month: number
): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/monthly?year=${year}&month=${month}`, {
      method: 'GET',
      headers: getAuthHeaders(), // Use consistent auth headers
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const schedules: ApiSchedule[] = await response.json();
    return schedules.map(apiScheduleToCalendarEvent);
  } catch (error) {
    console.error('Error fetching monthly schedules:', error);
    throw error;
  }
};

// 주간 일정 조회 (일요일 시작)
export const getWeeklySchedules = async (
  startDate: Date
): Promise<CalendarEvent[]> => {
  try {
    // 시작 날짜가 일요일이 되도록 조정
    const daysSinceSunday = (startDate.getDay() + 1) % 7;
    const sunday = new Date(startDate);
    sunday.setDate(sunday.getDate() - daysSinceSunday);
    
    const dateString = sunday.toISOString().split('T')[0];
    
    const response = await fetch(`${API_BASE_URL}/weekly?start_date=${dateString}`, {
      method: 'GET',
      headers: getAuthHeaders(), // Use consistent auth headers
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const schedules: ApiSchedule[] = await response.json();
    return schedules.map(apiScheduleToCalendarEvent);
  } catch (error) {
    console.error('Error fetching weekly schedules:', error);
    throw error;
  }
};

// 월별 뷰 조회
export const getMonthlyView = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/monthly-view`, {
      method: 'GET',
      headers: getAuthHeaders(), // Use consistent auth headers
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const schedules: ApiSchedule[] = data.schedules || [];
    return schedules.map(apiScheduleToCalendarEvent);
  } catch (error) {
    console.error('Error fetching monthly view:', error);
    throw error;
  }
};

// 주간 뷰 조회
export const getWeeklyView = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/weekly-view`, {
      method: 'GET',
      headers: getAuthHeaders(), // Use consistent auth headers
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const schedules: ApiSchedule[] = data.schedules || [];
    return schedules.map(apiScheduleToCalendarEvent);
  } catch (error) {
    console.error('Error fetching weekly view:', error);
    throw error;
  }
};