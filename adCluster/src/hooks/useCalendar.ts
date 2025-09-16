import { useState, useEffect, useCallback } from 'react';

// 일정 이벤트 타입 정의
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  category: 'work' | 'personal' | 'meeting' | 'deadline' | 'other';
  priority: 'low' | 'medium' | 'high';
  color: string;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // 분 단위로 알림 시간
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 달력 뷰 타입
export type CalendarView = 'month' | 'week' | 'day';

// 카테고리별 색상 매핑
export const CATEGORY_COLORS = {
  work: '#3B82F6',      // 파란색
  personal: '#10B981',  // 초록색
  meeting: '#F59E0B',   // 주황색
  deadline: '#EF4444',  // 빨간색
  other: '#8B5CF6'      // 보라색
};

// 우선순위별 색상 강도
export const PRIORITY_OPACITY = {
  low: '0.6',
  medium: '0.8',
  high: '1.0'
};

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 샘플 데이터 생성
  const createSampleEvents = (): CalendarEvent[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    return [
      {
        id: 'sample-1',
        title: '팀 미팅',
        description: '주간 팀 미팅 - 프로젝트 진행 상황 공유',
        startDate: today,
        endDate: today,
        startTime: '10:00',
        endTime: '11:00',
        isAllDay: false,
        category: 'meeting',
        priority: 'high',
        color: CATEGORY_COLORS.meeting,
        location: '회의실 A',
        attendees: ['김철수', '이영희', '박민수'],
        reminders: [15, 5],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-2',
        title: '프로젝트 마감',
        description: 'ADO 클러스터 프로젝트 최종 제출',
        startDate: tomorrow,
        endDate: tomorrow,
        isAllDay: true,
        category: 'deadline',
        priority: 'high',
        color: CATEGORY_COLORS.deadline,
        reminders: [60, 30, 10],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-3',
        title: '개인 운동',
        description: '헬스장에서 운동하기',
        startDate: today,
        endDate: today,
        startTime: '19:00',
        endTime: '20:30',
        isAllDay: false,
        category: 'personal',
        priority: 'medium',
        color: CATEGORY_COLORS.personal,
        location: '피트니스 센터',
        reminders: [30],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-4',
        title: '클라이언트 미팅',
        description: '새로운 프로젝트 제안서 발표',
        startDate: nextWeek,
        endDate: nextWeek,
        startTime: '14:00',
        endTime: '16:00',
        isAllDay: false,
        category: 'work',
        priority: 'high',
        color: CATEGORY_COLORS.work,
        location: '클라이언트 사무실',
        attendees: ['홍길동', '김대리'],
        reminders: [120, 30],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-5',
        title: '생일 파티',
        description: '친구 생일 축하 파티',
        startDate: nextMonth,
        endDate: nextMonth,
        startTime: '18:00',
        endTime: '22:00',
        isAllDay: false,
        category: 'personal',
        priority: 'medium',
        color: CATEGORY_COLORS.personal,
        location: '레스토랑',
        reminders: [1440, 60], // 1일 전, 1시간 전
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sample-6',
        title: '코드 리뷰',
        description: '신규 기능 코드 리뷰 및 피드백',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2일 후
        endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '15:00',
        endTime: '16:30',
        isAllDay: false,
        category: 'work',
        priority: 'medium',
        color: CATEGORY_COLORS.work,
        attendees: ['개발팀'],
        reminders: [30],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  };

  // 로컬 스토리지에서 이벤트 로드
  useEffect(() => {
    const loadEvents = () => {
      try {
        const savedEvents = localStorage.getItem('calendar-events');
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
            recurring: event.recurring ? {
              ...event.recurring,
              endDate: event.recurring.endDate ? new Date(event.recurring.endDate) : undefined
            } : undefined
          }));
          setEvents(parsedEvents);
        } else {
          // 저장된 이벤트가 없으면 샘플 데이터 사용
          const sampleEvents = createSampleEvents();
          setEvents(sampleEvents);
          localStorage.setItem('calendar-events', JSON.stringify(sampleEvents));
        }
      } catch (error) {
        console.error('Failed to load events from localStorage:', error);
        setError('이벤트를 불러오는데 실패했습니다.');
        // 오류 발생 시에도 샘플 데이터 사용
        const sampleEvents = createSampleEvents();
        setEvents(sampleEvents);
      }
    };

    loadEvents();
  }, []);

  // 이벤트 저장
  const saveEvents = useCallback((newEvents: CalendarEvent[]) => {
    try {
      localStorage.setItem('calendar-events', JSON.stringify(newEvents));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
      setError('이벤트를 저장하는데 실패했습니다.');
    }
  }, []);

  // 새 이벤트 추가
  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    return newEvent;
  }, [events, saveEvents]);

  // 이벤트 수정
  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(event => 
      event.id === eventId 
        ? { ...event, ...updates, updatedAt: new Date() }
        : event
    );
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  }, [events, saveEvents]);

  // 이벤트 삭제
  const deleteEvent = useCallback((eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  }, [events, saveEvents]);

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const targetDate = new Date(date);
      
      // 날짜만 비교 (시간 제외)
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      targetDate.setHours(0, 0, 0, 0);
      
      return targetDate >= eventStart && targetDate <= eventEnd;
    });
  }, [events]);

  // 특정 월의 이벤트 가져오기
  const getEventsForMonth = useCallback((year: number, month: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return (
        (eventStart.getFullYear() === year && eventStart.getMonth() === month) ||
        (eventEnd.getFullYear() === year && eventEnd.getMonth() === month) ||
        (eventStart.getFullYear() <= year && eventStart.getMonth() <= month &&
         eventEnd.getFullYear() >= year && eventEnd.getMonth() >= month)
      );
    });
  }, [events]);

  // 달력 네비게이션
  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const navigateToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const navigateToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  // 이벤트 모달 관리
  const openEventModal = useCallback((event?: CalendarEvent) => {
    setSelectedEvent(event || null);
    setIsEventModalOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setSelectedEvent(null);
    setIsEventModalOpen(false);
  }, []);

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    setCurrentDate,
    setView,
    addEvent,
    updateEvent,
    deleteEvent,
    
    // 유틸리티
    getEventsForDate,
    getEventsForMonth,
    navigateToToday,
    navigateToPrevious,
    navigateToNext,
    
    // 모달 관리
    openEventModal,
    closeEventModal,
    
    // 에러 관리
    clearError
  };
};

export default useCalendar;