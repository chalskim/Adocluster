import { 
  UserSchedule, 
  UserScheduleCreate, 
  UserScheduleUpdate, 
  UserScheduleFilters,
  UserScheduleResponse,
  RecurrencePattern, 
  ScheduleCategory 
} from '../types/UserScheduleTypes';
import { getAuthHeaders, getApiBaseUrl } from './api';

const API_BASE_URL = `${getApiBaseUrl()}/api/user-schedules`;

// 사용자 일정 생성
export const createUserSchedule = async (schedule: UserScheduleCreate): Promise<UserSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schedule)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `일정 생성 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating user schedule:', error);
    throw error;
  }
};

// 사용자 일정 목록 조회 (필터링 지원)
export const getUserSchedules = async (filters: UserScheduleFilters): Promise<UserSchedule[]> => {
  try {
    const params = new URLSearchParams({ 
      user_id: filters.user_id.toString() 
    });
    
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }

    if (filters.category) {
      params.append('category', filters.category);
    }

    const response = await fetch(`${API_BASE_URL}/?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `일정 조회 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    throw error;
  }
};

// 특정 일정 조회
export const getUserSchedule = async (scheduleId: number): Promise<UserSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${scheduleId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `일정 조회 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user schedule:', error);
    throw error;
  }
};

// 일정 수정
export const updateUserSchedule = async (
  scheduleId: number,
  updates: UserScheduleUpdate
): Promise<UserSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${scheduleId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `일정 수정 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating user schedule:', error);
    throw error;
  }
};

// 일정 삭제 (소프트 삭제)
export const deleteUserSchedule = async (scheduleId: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${scheduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `일정 삭제 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting user schedule:', error);
    throw error;
  }
};

// 오늘의 일정 조회
export const getTodaySchedules = async (userId: number): Promise<UserSchedule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/today/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `오늘 일정 조회 실패: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching today schedules:', error);
    throw error;
  }
};

// 월별 일정 조회 헬퍼 함수
export const getMonthlySchedules = async (
  userId: number, 
  year: number, 
  month: number
): Promise<UserSchedule[]> => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 해당 월의 마지막 날
  
  return getUserSchedules({
    user_id: userId,
    start_date: startDate,
    end_date: endDate
  });
};

// 주별 일정 조회 헬퍼 함수
export const getWeeklySchedules = async (
  userId: number,
  startOfWeek: string,
  endOfWeek: string
): Promise<UserSchedule[]> => {
  return getUserSchedules({
    user_id: userId,
    start_date: startOfWeek,
    end_date: endOfWeek
  });
};

// 카테고리별 일정 조회 헬퍼 함수
export const getSchedulesByCategory = async (
  userId: number,
  category: ScheduleCategory,
  startDate?: string,
  endDate?: string
): Promise<UserSchedule[]> => {
  return getUserSchedules({
    user_id: userId,
    category,
    start_date: startDate,
    end_date: endDate
  });
};