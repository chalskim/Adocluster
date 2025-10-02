import React, { useState } from 'react';
import { formatDateToLocal } from '../utils/dateUtils';

// 샘플 이벤트 데이터
const sampleEvents = [
  {
    id: '1',
    title: '연구계획 회의',
    date: '2024-01-14',
    day: '일',
    time: '10:00 - 11:30',
    category: 'meeting',
    description: '연구 프로젝트 진행 상황 점검 및 다음 단계 계획 수립'
  },
  {
    id: '2',
    title: '데이터 수집',
    date: '2024-01-15',
    day: '월',
    time: '14:00 - 16:00',
    category: 'work',
    description: '설문조사 데이터 수집 및 정리'
  },
  {
    id: '3',
    title: '논문 리뷰',
    date: '2024-01-16',
    day: '화',
    time: '09:00 - 12:00',
    category: 'personal',
    description: '최근 5년간 관련 논문 10편 리뷰 및 요약'
  },
  {
    id: '4',
    title: '중간 발표 준비',
    date: '2024-01-18',
    day: '목',
    time: '13:00 - 15:00',
    category: 'deadline',
    description: '연구 중간 발표 자료 준비 및 리허설'
  },
  {
    id: '5',
    title: '팀 미팅',
    date: '2024-01-19',
    day: '금',
    time: '11:00 - 12:00',
    category: 'meeting',
    description: '주간 업무 보고 및 계획 공유'
  }
];

// 카테고리별 색상 정의
const CATEGORY_COLORS: Record<string, string> = {
  work: '#3b82f6',
  personal: '#10b981',
  meeting: '#f59e0b',
  deadline: '#ef4444',
  other: '#6b7280'
};

// 카테고리별 라벨
const CATEGORY_LABELS: Record<string, string> = {
  work: '업무',
  personal: '개인',
  meeting: '회의',
  deadline: '마감일',
  other: '기타'
};

const WeeklyScheduleView: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 주간 날짜 생성
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // 주 시작을 일요일로
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (dateString: string) => {
    return sampleEvents.filter(event => event.date === dateString);
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return formatDateToLocal(date);
  };

  // 날짜 표시 포맷
  const displayDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 요일 이름
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 주간 날짜들
  const weekDates = getWeekDates();

  // 미니 캘린더 생성
  const generateMiniCalendar = () => {
    const year = currentWeek.getFullYear();
    const month = currentWeek.getMonth();
    
    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 달력 시작일 (이전 월의 마지막 주 포함)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 일요일 시작
    
    // 달력 종료일 (다음 월의 첫 주 포함)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    // 달력에 표시할 날짜들 생성
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const miniCalendarDates = generateMiniCalendar();

  // 현재 월 이름
  const getCurrentMonthName = () => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[currentWeek.getMonth()];
  };

  // 날짜가 현재 주에 속하는지 확인
  const isCurrentWeek = (date: Date) => {
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    return date >= weekStart && date <= weekEnd;
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 주 이동
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };

  return (
    <div className="weekly-schedule-view bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">주간 일정</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="font-medium text-gray-700">
            {currentWeek.getFullYear()}년 {getCurrentMonthName()}
          </span>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 좌측: Google 캘린더 형태의 주간 일정표 */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
            <div className="bg-white p-2"></div>
            {weekDates.map((date, index) => (
              <div 
                key={index} 
                className={`bg-white p-2 text-center ${isToday(date) ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-xs font-medium ${index === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-semibold ${isToday(date) ? 'text-blue-600' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 시간대별 일정표 */}
          <div className="border border-gray-200 rounded-b-lg overflow-hidden">
            {Array.from({ length: 12 }, (_, hour) => hour + 8).map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200 min-h-16">
                <div className="bg-white p-2 text-right text-xs text-gray-500 pr-2 pt-1">
                  {hour}:00
                </div>
                {weekDates.map((_, dayIndex) => {
                  const date = weekDates[dayIndex];
                  const dateString = formatDate(date);
                  const dayEvents = getEventsForDate(dateString).filter(event => {
                    const [eventHour] = event.time.split(':');
                    return parseInt(eventHour) === hour;
                  });
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`bg-white p-1 min-h-16 cursor-pointer hover:bg-gray-50 ${dayIndex === 0 ? 'border-r-2 border-red-100' : ''}`}
                      onClick={() => alert(`새 일정 추가: ${date.toLocaleDateString()}`)}
                    >
                      {dayEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="p-1 mb-1 text-xs rounded truncate"
                          style={{ backgroundColor: `${CATEGORY_COLORS[event.category]}20` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`이벤트 상세: ${event.title}`);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-gray-600">{event.time}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 작은 달력과 범례 (폭 축소) */}
        <div className="space-y-4">
          {/* 작은 달력 */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-md font-semibold text-gray-800 mb-2 text-center">
              {getCurrentMonthName()}
            </h3>
            
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div 
                  key={day} 
                  className={`text-center text-xs font-medium py-1 ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {miniCalendarDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentWeek.getMonth();
                const isCurrentWeekDate = isCurrentWeek(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`h-6 flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors ${
                      !isCurrentMonth 
                        ? 'text-gray-400' 
                        : isTodayDate 
                          ? 'bg-blue-500 text-white' 
                          : isCurrentWeekDate 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      const newDate = new Date(currentWeek);
                      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                      setCurrentWeek(newDate);
                    }}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 범례 */}
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-md font-semibold text-gray-800 mb-2">일정 범례</h3>
            <div className="space-y-1">
              {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-xs text-gray-700">
                    {CATEGORY_LABELS[category]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyScheduleView;