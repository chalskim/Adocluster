import React, { useMemo } from 'react';
import { CalendarEvent, CATEGORY_COLORS, PRIORITY_OPACITY } from '../hooks/useCalendar';

interface CalendarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateDoubleClick?: (date: Date) => void;
  selectedDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onDateDoubleClick,
  selectedDate
}) => {
  // 달력 데이터 계산
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 달력 시작일 (이전 월의 마지막 주 포함)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
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
    
    return {
      year,
      month,
      firstDay,
      lastDay,
      dates
    };
  }, [currentDate]);

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
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
  };

  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarData.month;
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

  // 선택된 날짜인지 확인
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // 월 이름 가져오기
  const getMonthName = (month: number) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month];
  };

  // 요일 이름
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar bg-white rounded-lg shadow-lg p-4 md:p-6">
      {/* 달력 헤더 */}
      <div className="calendar-header mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {calendarData.year}년 {getMonthName(calendarData.month)}
        </h2>
      </div>

      {/* 요일 헤더 */}
      <div className="calendar-weekdays grid grid-cols-7 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center py-1 md:py-2 text-xs md:text-sm font-semibold ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 날짜 그리드 */}
      <div className="calendar-grid grid grid-cols-7">
        {calendarData.dates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={index}
              className={`calendar-day min-h-20 md:h-32 w-full p-1 md:p-3 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 flex flex-col ${
                !isCurrentMonthDate ? 'bg-gray-100 text-gray-400' : 'bg-white'
              } ${
                isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              } ${
                isSelectedDate ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
              onClick={() => onDateClick(date)}
              onDoubleClick={() => onDateDoubleClick?.(date)}
            >
              {/* 날짜 숫자 */}
              <div className={`text-xs md:text-sm font-medium mb-1 ${
                isTodayDate ? 'text-blue-700' : 
                isSelectedDate ? 'text-green-700' :
                !isCurrentMonthDate ? 'text-gray-400' :
                isWeekend ? (date.getDay() === 0 ? 'text-red-600' : 'text-blue-600') : 'text-gray-700'
              }`}>
                {date.getDate()}
              </div>

              {/* 이벤트 표시 - 선 형태 */}
              <div className="events flex-1 space-y-0.5 md:space-y-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className="event-line h-1 md:h-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: CATEGORY_COLORS[event.category],
                      opacity: PRIORITY_OPACITY[event.priority]
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title={event.title}
                  >
                  </div>
                ))}
                
                {/* 더 많은 이벤트가 있을 때 표시 */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium text-center">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="calendar-legend mt-4 md:mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">카테고리</h4>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1 md:gap-2">
              <div
                className="w-2 h-2 md:w-3 md:h-3 rounded"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600">
                {category === 'work' ? '업무' :
                 category === 'personal' ? '개인' :
                 category === 'meeting' ? '회의' :
                 category === 'deadline' ? '마감일' : '기타'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;