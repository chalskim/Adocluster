import React, { useState, useCallback } from 'react';
import Calendar from './Calendar';
import EventModal from './EventModal';
import { useCalendar, CalendarEvent, CalendarView } from '../hooks/useCalendar';

// 카테고리별 색상 정의
const CATEGORY_COLORS: Record<string, string> = {
  work: '#3b82f6',
  personal: '#10b981',
  meeting: '#f59e0b',
  deadline: '#ef4444',
  other: '#6b7280'
};

const CalendarManagementPage: React.FC = () => {
  const {
    events,
    currentDate,
    view,
    addEvent,
    updateEvent,
    deleteEvent,
    setCurrentDate,
    setView,
    getEventsForDate,
    getEventsForMonth
  } = useCalendar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // 모달 열기/닫기 핸들러
  const openModal = useCallback((event?: CalendarEvent, date?: Date) => {
    setSelectedEvent(event || null);
    setSelectedDate(date || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  }, []);

  // 이벤트 저장 핸들러
  const handleSaveEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    addEvent(eventData);
  }, [addEvent]);

  // 이벤트 업데이트 핸들러
  const handleUpdateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    updateEvent(eventId, updates);
  }, [updateEvent]);

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = useCallback((eventId: string) => {
    deleteEvent(eventId);
  }, [deleteEvent]);

  // 날짜 클릭 핸들러
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // 날짜 더블클릭 핸들러 (새 일정 추가)
  const handleDateDoubleClick = useCallback((date: Date) => {
    openModal(undefined, date);
  }, [openModal]);

  // 이벤트 클릭 핸들러
  const handleEventClick = useCallback((event: CalendarEvent) => {
    openModal(event);
  }, [openModal]);

  // 뷰 변경 핸들러
  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
  }, [setView]);

  // 날짜 네비게이션 핸들러
  const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);
    
    switch (direction) {
      case 'prev':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'next':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'today':
        setCurrentDate(new Date());
        return;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, view, setCurrentDate]);

  // 필터링된 이벤트 가져오기
  const getFilteredEvents = useCallback(() => {
    let filteredEvents = events;

    // 검색어 필터
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 카테고리 필터
    if (filterCategory !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === filterCategory);
    }

    // 우선순위 필터
    if (filterPriority !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.priority === filterPriority);
    }

    return filteredEvents;
  }, [events, searchTerm, filterCategory, filterPriority]);

  // 현재 날짜 포맷팅
  const formatCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    
    if (view === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    }
    
    return currentDate.toLocaleDateString('ko-KR', options);
  };

  // 통계 정보 계산
  const getStatistics = () => {
    const filteredEvents = getFilteredEvents();
    const today = new Date();
    const todayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today.toDateString();
    });
    
    const upcomingEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate > today;
    });

    return {
      total: filteredEvents.length,
      today: todayEvents.length,
      upcoming: upcomingEvents.length
    };
  };

  const statistics = getStatistics();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">일정 관리</h1>
            <p className="text-gray-600 mt-1">{formatCurrentDate()}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            새 일정 추가
          </button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="fas fa-calendar text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">전체 일정</p>
                <p className="text-xl font-semibold text-gray-800">{statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">오늘 일정</p>
                <p className="text-xl font-semibold text-gray-800">{statistics.today}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <i className="fas fa-arrow-right text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">예정된 일정</p>
                <p className="text-xl font-semibold text-gray-800">{statistics.upcoming}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 컨트롤 바 */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* 날짜 네비게이션 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('today')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              오늘
            </button>
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* 뷰 선택 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => handleViewChange(viewOption)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === viewOption
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {viewOption === 'month' ? '월' : viewOption === 'week' ? '주' : '일'}
              </button>
            ))}
          </div>

          {/* 검색 및 필터 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="일정 검색..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 카테고리</option>
              <option value="work">업무</option>
              <option value="personal">개인</option>
              <option value="meeting">회의</option>
              <option value="deadline">마감일</option>
              <option value="other">기타</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 우선순위</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex gap-6 p-6">
        {/* 달력 영역 */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <Calendar
               events={getFilteredEvents()}
               currentDate={currentDate}
               onDateClick={handleDateClick}
               onEventClick={handleEventClick}
               onDateDoubleClick={handleDateDoubleClick}
               selectedDate={selectedDate ? selectedDate : undefined}
             />
          </div>
        </div>

        {/* 선택한 날짜의 일정 목록 */}
        <div className="w-96">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedDate ? (
                  <>
                    {selectedDate.toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })} 일정
                  </>
                ) : (
                  '날짜를 선택하세요'
                )}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => handleDateDoubleClick(selectedDate)}
                  className="mt-2 w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  새 일정 추가
                </button>
              )}
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
              {selectedDate ? (
                (() => {
                  const dayEvents = getEventsForDate(selectedDate!).filter(event => {
                    let matches: boolean = true;
                    if (searchTerm) {
                      const searchMatch = (
                        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
                      );
                      matches = matches && searchMatch;
                    }
                    if (filterCategory !== 'all') {
                      matches = matches && Boolean(event.category === filterCategory);
                    }
                    if (filterPriority !== 'all') {
                      matches = matches && Boolean(event.priority === filterPriority);
                    }
                    return matches;
                  });

                  return dayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                              style={{
                                backgroundColor: CATEGORY_COLORS[event.category]
                              }}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">
                                {event.title}
                              </h4>
                              {event.isAllDay === false && event.startTime && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {event.startTime}
                                  {event.endTime && ` - ${event.endTime}`}
                                </p>
                              )}
                              {event.location && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                  <i className="fas fa-map-marker-alt text-xs"></i>
                                  {event.location}
                                </p>
                              )}
                              {event.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  event.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {event.priority === 'high' ? '높음' :
                                   event.priority === 'medium' ? '보통' : '낮음'}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {event.category === 'work' ? '업무' :
                                   event.category === 'personal' ? '개인' :
                                   event.category === 'meeting' ? '회의' :
                                   event.category === 'deadline' ? '마감일' : '기타'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <i className="fas fa-calendar-times text-3xl mb-3"></i>
                      <p>이 날짜에는 일정이 없습니다.</p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <i className="fas fa-calendar-alt text-3xl mb-3"></i>
                  <p>달력에서 날짜를 클릭하여</p>
                  <p>해당 날짜의 일정을 확인하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 이벤트 모달 */}
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate || undefined}
      />
    </div>
  );
};

export default CalendarManagementPage;