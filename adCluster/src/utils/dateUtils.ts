/**
 * 날짜 관련 유틸리티 함수들
 * JavaScript의 toISOString() UTC 변환으로 인한 날짜 오차 문제를 해결
 */

/**
 * Date 객체를 로컬 시간대 기준으로 YYYY-MM-DD 형식의 문자열로 변환
 * toISOString()과 달리 UTC 변환 없이 로컬 날짜를 유지
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
 * 시간대 변환 없이 로컬 날짜로 생성
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 두 날짜가 같은 날인지 비교 (시간 무시)
 */
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 날짜가 특정 범위 내에 있는지 확인
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  return targetDate >= start && targetDate <= end;
};

/**
 * 월의 첫 번째 날과 마지막 날을 반환
 */
export const getMonthRange = (year: number, month: number): { startDate: Date; endDate: Date } => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
};

/**
 * 주의 시작일(일요일)과 종료일(토요일)을 반환
 */
export const getWeekRange = (date: Date): { startDate: Date; endDate: Date } => {
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay());
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return { startDate, endDate };
};

/**
 * 오늘 날짜인지 확인
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDate(date, today);
};

/**
 * 현재 월인지 확인
 */
export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return (
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  );
};