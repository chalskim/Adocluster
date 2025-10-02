import { useState, useEffect, useCallback } from 'react';
import * as userScheduleService from '../services/userScheduleService';
import { UserSchedule, ScheduleCategory, RecurrencePattern, UserScheduleCreate, UserScheduleUpdate } from '../types/UserScheduleTypes';
import { useToastContext } from '../contexts/ToastContext';
import { formatDateToLocal, getWeekRange, isSameDate, isDateInRange } from '../utils/dateUtils';

// 일정 이벤트 타입 정의 (UserSchedule을 기반으로 한 CalendarEvent)
export interface CalendarEvent extends UserSchedule {
  // 캘린더 표시용 추가 속성
  isAllDay?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

// 달력 뷰 타입
export type CalendarView = 'month' | 'week' | 'day';

// 카테고리별 색상 매핑
export const CATEGORY_COLORS = {
  WORK: '#3B82F6',      // 파란색
  PERSONAL: '#10B981',  // 초록색
  MEETING: '#F59E0B',   // 주황색
  DEADLINE: '#EF4444',  // 빨간색
  OTHER: '#8B5CF6'      // 보라색
};

// 우선순위별 색상 강도
export const PRIORITY_OPACITY = {
  low: '0.6',
  medium: '0.8',
  high: '1.0'
};

export const useCalendar = (userId?: number) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showSuccess, showError } = useToastContext();

  // UserSchedule을 CalendarEvent로 변환하는 헬퍼 함수
  const convertToCalendarEvent = (schedule: UserSchedule): CalendarEvent => ({
    ...schedule,
    isAllDay: !schedule.us_starttime || !schedule.us_endtime,
    priority: 'medium' // 기본값
  });

  // 이벤트 로드 함수
  const loadEvents = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let schedules: UserSchedule[] = [];
      
      if (view === 'month') {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        schedules = await userScheduleService.getMonthlySchedules(userId, year, month);
      } else if (view === 'week') {
        const { startDate, endDate } = getWeekRange(currentDate);
        
        schedules = await userScheduleService.getWeeklySchedules(
          userId,
          formatDateToLocal(startDate),
          formatDateToLocal(endDate)
        );
      } else {
        // day view - 해당 날짜의 일정만 조회
        const startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
        
        schedules = await userScheduleService.getUserSchedules({
          user_id: userId,
          start_date: formatDateToLocal(startDate),
          end_date: formatDateToLocal(endDate)
        });
      }
      
      const calendarEvents = schedules.map(convertToCalendarEvent);
      setEvents(calendarEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentDate, view]);

  // 이벤트 로드
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // 새 이벤트 추가
  const addEvent = async (eventData: any): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null); // 이전 오류 클리어
      
      // EventModal에서 전달된 데이터를 백엔드 API 스키마에 맞게 변환
      const transformedData: UserScheduleCreate = {
        us_userid: userId || 1, // 기본값 또는 현재 사용자 ID
        us_title: eventData.us_title || eventData.title || '제목 없음', // 필수 필드 보장
        us_description: eventData.us_description || eventData.description || null,
        us_startday: eventData.us_startday || eventData.startDate || formatDateToLocal(new Date()), // 필수 필드
      us_endday: eventData.us_endday || eventData.endDate || eventData.us_startday || eventData.startDate || formatDateToLocal(new Date()), // 필수 필드
        us_starttime: eventData.isAllDay ? null : (eventData.us_starttime || eventData.startTime),
        us_endtime: eventData.isAllDay ? null : (eventData.us_endtime || eventData.endTime),
        us_category: eventData.us_category || eventData.category || 'OTHER', // 기본값 설정
        us_location: eventData.us_location || eventData.location || null,
        us_attendees: eventData.us_attendees || eventData.attendees || null,
        us_remindersettings: eventData.us_remindersettings || eventData.reminders || null,
        us_color: eventData.us_color || eventData.color || null,
        us_isrecurring: eventData.us_isrecurring || false, // 필수 필드, 기본값 false
        us_recurrencepattern: eventData.us_recurrencepattern || undefined,
        us_recurrenceenddate: eventData.us_recurrenceenddate || undefined
      };
      
      console.log('Sending data to backend:', transformedData);
      
      const newSchedule = await userScheduleService.createUserSchedule(transformedData);
      const newEvent = convertToCalendarEvent(newSchedule);
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // 성공 메시지 표시
      showSuccess('일정 추가 완료', '새로운 일정이 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('Error adding event:', error);
      const errorMessage = error instanceof Error ? error.message : '일정 추가에 실패했습니다.';
      setError(errorMessage);
      
      // 오류 메시지 표시
      showError('일정 추가 실패', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 이벤트 수정
  const updateEvent = async (eventId: number, updates: UserScheduleUpdate): Promise<void> => {
    try {
      setIsLoading(true);
      const updatedSchedule = await userScheduleService.updateUserSchedule(eventId, updates);
      const updatedEvent = convertToCalendarEvent(updatedSchedule);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.us_id === eventId ? updatedEvent : event
        )
      );
      
      // 성공 메시지 표시
      showSuccess('일정 수정 완료', '일정이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = '일정 수정에 실패했습니다.';
      setError(errorMessage);
      
      // 오류 메시지 표시
      showError('일정 수정 실패', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 이벤트 삭제
  const deleteEvent = async (eventId: number): Promise<void> => {
    try {
      setIsLoading(true);
      await userScheduleService.deleteUserSchedule(eventId);
      setEvents(prevEvents => prevEvents.filter(event => event.us_id !== eventId));
      
      // 성공 메시지 표시
      showSuccess('일정 삭제 완료', '일정이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = '일정 삭제에 실패했습니다.';
      setError(errorMessage);
      
      // 오류 메시지 표시
      showError('일정 삭제 실패', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 날짜의 이벤트 조회
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStartDate = new Date(event.us_startday);
      const eventEndDate = event.us_endday ? new Date(event.us_endday) : eventStartDate;
      
      return isDateInRange(date, eventStartDate, eventEndDate);
    });
  };

  // 특정 월의 이벤트 조회
  const getEventsForMonth = (year: number, month: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.us_startday);
      return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    });
  };

  // 달력 네비게이션
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // 이벤트 모달 관리
  const openEventModal = (event?: CalendarEvent) => {
    setSelectedEvent(event || null);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(false);
  };

  // 에러 클리어
  const clearError = () => {
    setError(null);
  };

  return {
    // 상태
    events,
    currentDate,
    view,
    selectedEvent,
    isEventModalOpen,
    isLoading,
    error,
    
    // 액션
    setView,
    setCurrentDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForMonth,
    navigateToToday,
    navigateToPrevious,
    navigateToNext,
    openEventModal,
    closeEventModal,
    clearError,
    loadEvents
  };
};

export default useCalendar;