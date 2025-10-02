import React, { useState, useEffect } from 'react';
import { CalendarEvent, CATEGORY_COLORS } from '../hooks/useCalendar';
import { ScheduleCategory } from '../types/UserScheduleTypes';
import { formatDateToLocal } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'us_id' | 'us_createdat' | 'us_updatedat' | 'us_deletedat' | 'us_isdeleted'>) => void;
  onUpdate?: (eventId: number, updates: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: number) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  event,
  selectedDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    category: ScheduleCategory.WORK as CalendarEvent['us_category'],
    priority: 'medium' as CalendarEvent['priority'],
    location: '',
    attendees: [] as string[],
    reminders: [] as number[]
  });

  const [attendeeInput, setAttendeeInput] = useState('');
  const [reminderInput, setReminderInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false); // For collapsible section

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // 기존 이벤트 수정
        setFormData({
          title: event.us_title,
          description: event.us_description || '',
          startDate: event.us_startday,
          endDate: event.us_endday,
          startTime: event.us_starttime || '',
          endTime: event.us_endtime || '',
          isAllDay: event.isAllDay || false,
          category: event.us_category,
          priority: event.priority || 'medium',
          location: event.us_location || '',
          attendees: event.us_attendees ? [event.us_attendees] : [],
          reminders: [] // UserSchedule에는 reminders가 없음
        });
      } else {
        // 새 이벤트 생성
        const defaultDate = selectedDate || new Date();
        const dateString = formatDateToLocal(defaultDate);
        setFormData({
          title: '',
          description: '',
          startDate: dateString,
          endDate: dateString,
          startTime: '',
          endTime: '',
          isAllDay: false,
          category: ScheduleCategory.WORK,
          priority: 'medium',
          location: '',
          attendees: [],
          reminders: []
        });
      }
      setErrors({});
      // 기본적으로 고급 설정 섹션을 닫음
      setIsAdvancedOpen(false);
    }
  }, [isOpen, event, selectedDate]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 참석자 추가
  const addAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };

  // 참석자 제거
  const removeAttendee = (attendee: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  // 알림 추가
  const addReminder = () => {
    const minutes = parseInt(reminderInput);
    if (!isNaN(minutes) && minutes > 0 && !formData.reminders.includes(minutes)) {
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, minutes].sort((a, b) => a - b)
      }));
      setReminderInput('');
    }
  };

  // 알림 제거
  const removeReminder = (minutes: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r !== minutes)
    }));
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜를 선택해주세요.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜를 선택해주세요.';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate > endDate) {
        newErrors.endDate = '종료 날짜는 시작 날짜보다 늦어야 합니다.';
      }
    }

    if (!formData.isAllDay) {
      if (!formData.startTime) {
        newErrors.startTime = '시작 시간을 입력해주세요.';
      }
      if (!formData.endTime) {
        newErrors.endTime = '종료 시간을 입력해주세요.';
      }
      if (formData.startTime && formData.endTime && formData.startDate === formData.endDate) {
        if (formData.startTime >= formData.endTime) {
          newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSave = () => {
    if (!validateForm()) return;

    const eventData = {
      us_userid: 1, // 임시 사용자 ID
      us_title: formData.title.trim(),
      us_description: formData.description.trim() || undefined,
      us_startday: formData.startDate,
      us_endday: formData.endDate,
      us_starttime: formData.isAllDay ? undefined : formData.startTime,
      us_endtime: formData.isAllDay ? undefined : formData.endTime,
      isAllDay: formData.isAllDay,
      us_category: formData.category,
      priority: formData.priority,
      us_color: CATEGORY_COLORS[formData.category as keyof typeof CATEGORY_COLORS],
      us_location: formData.location.trim() || undefined,
      us_attendees: formData.attendees.length > 0 ? formData.attendees.join(',') : undefined,
      us_remindersettings: undefined,
      us_isrecurring: false,
      us_recurrencepattern: undefined,
      us_recurrenceenddate: undefined
    };

    if (event) {
      onUpdate?.(event.us_id, eventData);
    } else {
      onSave(eventData);
    }
    onClose();
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (event && window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      onDelete?.(event.us_id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {event ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-4 space-y-3">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="일정 제목을 입력하세요"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 설명 - 1줄로 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="일정에 대한 설명을 입력하세요"
            />
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 날짜 *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 날짜 *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 종일 체크박스 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isAllDay" className="text-sm text-gray-700">
              종일
            </label>
          </div>

          {/* 시간 (종일이 아닐 때만 표시) */}
          {!formData.isAllDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작 시간 *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료 시간 *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>
          )}

          {/* 카테고리 및 우선순위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="work">업무</option>
                <option value="personal">개인</option>
                <option value="meeting">회의</option>
                <option value="deadline">마감일</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우선순위
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </div>
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="장소를 입력하세요"
            />
          </div>

          {/* 고급 설정 토글 버튼 */}
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <i className={`fas fa-chevron-${isAdvancedOpen ? 'down' : 'right'} mr-2`}></i>
              고급 설정
            </button>

            {/* 접을 수 있는 고급 설정 섹션 */}
            {isAdvancedOpen && (
              <div className="mt-3 space-y-3">
                {/* 참석자 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    참석자
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="참석자 이름을 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={addAttendee}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.attendees.map((attendee, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {attendee}
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 알림 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    알림 (분 단위)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={reminderInput}
                      onChange={(e) => setReminderInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addReminder()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="알림 시간(분)을 입력하세요"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={addReminder}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.reminders.map((minutes, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {minutes}분 전
                        <button
                          type="button"
                          onClick={() => removeReminder(minutes)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div>
            {event && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              {event ? '수정' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;