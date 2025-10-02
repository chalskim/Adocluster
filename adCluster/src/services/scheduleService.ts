import { CalendarEvent } from '../hooks/useCalendar';
import { getAuthHeaders, getApiBaseUrl } from './api'; // Import the consistent auth headers function

const API_BASE_URL = `${getApiBaseUrl()}/api/schedules`;

// API 요청 타입 정의
interface CreateScheduleRequest {
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  start_time?: string; // HH:MM:SS
  end_time?: string;   // HH:MM:SS
  is_all_day: boolean;
  category: string;
  priority: string;
  location?: string;
  attendees: string[];
  reminders: number[];
  recurrence_rule: string | null;
}

interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  start_time?: string; // HH:MM:SS
  end_time?: string;   // HH:MM:SS
  is_all_day?: boolean;
  category?: string;
  priority?: string;
  location?: string;
  attendees?: string[];
  reminders?: number[];
}

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
    us_userid: parseInt(schedule.user_id),
    us_title: schedule.title,
    us_description: schedule.description || undefined,
    us_startday: schedule.start_date,
    us_endday: schedule.end_date,
    us_starttime: schedule.start_time || undefined,
    us_endtime: schedule.end_time || undefined,
    us_category: schedule.category as CalendarEvent['us_category'],
    us_location: schedule.location || undefined,
    us_attendees: undefined, // API에서 제공하지 않음
    us_remindersettings: undefined,
    us_color: schedule.color || '#3B82F6',
    us_isrecurring: false, // 기본값
    us_recurrencepattern: undefined,
    us_recurrenceenddate: undefined,
    us_createdat: schedule.created_at,
    us_updatedat: schedule.updated_at,
    us_deletedat: undefined,
    us_isdeleted: false,
    isAllDay: schedule.is_all_day,
    priority: schedule.priority as CalendarEvent['priority']
  };
};

// 새로운 일정 생성
export const createSchedule = async (event: Omit<CalendarEvent, 'us_id' | 'us_createdat' | 'us_updatedat'>): Promise<CalendarEvent> => {
  try {
    // CalendarEvent를 API 요청 형식으로 변환
    const requestData: CreateScheduleRequest = {
      title: event.us_title,
      description: event.us_description,
      start_date: event.us_startday,
      end_date: event.us_endday,
      start_time: event.us_starttime,
      end_time: event.us_endtime,
      is_all_day: !event.us_starttime || !event.us_endtime,
      category: event.us_category,
      priority: event.priority || 'medium',
      location: event.us_location,
      attendees: event.us_attendees ? [event.us_attendees] : [],
      reminders: [], // UserSchedule에는 reminders가 없으므로 빈 배열
      recurrence_rule: null
    };

    // Get consistent auth headers
    const headers = getAuthHeaders();

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
      // Remove credentials: 'include' since we're sending the token in the Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: ApiSchedule = await response.json();
    return apiScheduleToCalendarEvent(data);
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

// 일정 목록 조회
export const getSchedules = async (
  startDate?: Date,
  endDate?: Date,
  projectId?: string,
  category?: string,
  priority?: string
): Promise<CalendarEvent[]> => {
  try {
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('start_date', startDate.toISOString().split('T')[0]);
    }
    
    if (endDate) {
      params.append('end_date', endDate.toISOString().split('T')[0]);
    }
    
    if (projectId) {
      params.append('project_id', projectId);
    }
    
    if (category) {
      params.append('category', category);
    }
    
    if (priority) {
      params.append('priority', priority);
    }

    // Get consistent auth headers
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers
      // Remove credentials: 'include' since we're sending the token in the Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    const schedules: ApiSchedule[] = data.schedules || data;
    
    return schedules.map(apiScheduleToCalendarEvent);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// 특정 일정 조회
export const getSchedule = async (id: string): Promise<CalendarEvent> => {
  try {
    // Get consistent auth headers
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers
      // Remove credentials: 'include' since we're sending the token in the Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: ApiSchedule = await response.json();
    return apiScheduleToCalendarEvent(data);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

// 일정 수정
export const updateSchedule = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  try {
    // 업데이트할 필드만 추출하여 API 요청 형식으로 변환
    const requestData: UpdateScheduleRequest = {};
    
    if (updates.us_title !== undefined) requestData.title = updates.us_title;
    if (updates.us_description !== undefined) requestData.description = updates.us_description;
    if (updates.us_startday !== undefined) requestData.start_date = updates.us_startday;
    if (updates.us_endday !== undefined) requestData.end_date = updates.us_endday;
    if (updates.us_starttime !== undefined) requestData.start_time = updates.us_starttime;
    if (updates.us_endtime !== undefined) requestData.end_time = updates.us_endtime;
    if (updates.isAllDay !== undefined) requestData.is_all_day = updates.isAllDay;
    if (updates.us_category !== undefined) requestData.category = updates.us_category;
    if (updates.priority !== undefined) requestData.priority = updates.priority;
    if (updates.us_location !== undefined) requestData.location = updates.us_location;
    if (updates.us_attendees !== undefined) requestData.attendees = updates.us_attendees ? [updates.us_attendees] : [];
    // reminders는 UserSchedule에 없으므로 제거

    // Get consistent auth headers
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestData)
      // Remove credentials: 'include' since we're sending the token in the Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: ApiSchedule = await response.json();
    return apiScheduleToCalendarEvent(data);
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// 일정 삭제
export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    // Get consistent auth headers
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers
      // Remove credentials: 'include' since we're sending the token in the Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};