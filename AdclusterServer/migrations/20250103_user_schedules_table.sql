-- 마이그레이션: user_schedules_table
-- 생성 시간: 2025-01-03
-- 설명: 기존 research_schedules 테이블을 user_schedules 테이블로 대체

-- 업그레이드
-- ENUM 타입 생성 (기존 것이 있다면 재사용)
DO $$ BEGIN
    CREATE TYPE recurrence_pattern AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_category AS ENUM ('WORK', 'PERSONAL', 'MEETING', 'DEADLINE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- user_schedules 테이블 생성
CREATE TABLE user_schedules (
    us_id SERIAL PRIMARY KEY,                      -- 일정 고유 ID
    us_userid INTEGER NOT NULL,                    -- 사용자 ID
    us_title VARCHAR(255) NOT NULL,                -- 일정 제목
    us_description TEXT,                           -- 일정 설명
    us_startDay DATE,                              -- 일정 시작 날짜
    us_endDay DATE,                                -- 일정 종료 날짜
    us_category schedule_category,                 -- 일정 종류(업무, 개인, 회의, 마감일, 기타)
    us_startTime TIME WITHOUT TIME ZONE,           -- 일정 시작 시간
    us_endTime TIME WITHOUT TIME ZONE,             -- 일정 종료 시간
    us_location VARCHAR(255),                      -- 일정 장소
    us_attendees TEXT,                             -- 참석자 목록
    us_reminderSettings JSONB,                     -- 알림 설정(JSON)
    us_color varchar(7),                           -- 사용자 지정색상
    
    -- 반복 일정 관련
    us_isRecurring BOOLEAN DEFAULT FALSE,          -- 반복 여부
    us_recurrencePattern recurrence_pattern,       -- 반복 패턴 (ENUM)
    us_recurrenceEndDate DATE,                     -- 반복 종료일

    -- 관리 필드
    us_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성 시각
    us_updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 수정 시각
    us_deletedAt TIMESTAMP DEFAULT NULL,             -- 삭제 시각
    us_isDeleted BOOLEAN DEFAULT FALSE             -- 삭제 여부
);

-- 컬럼 주석
COMMENT ON TABLE user_schedules IS '사용자 일정 관리 테이블';
COMMENT ON COLUMN user_schedules.us_id IS '일정 고유 ID (Primary Key)';
COMMENT ON COLUMN user_schedules.us_userid IS '사용자 ID';
COMMENT ON COLUMN user_schedules.us_title IS '일정 제목';
COMMENT ON COLUMN user_schedules.us_description IS '일정 설명';
COMMENT ON COLUMN user_schedules.us_startDay IS '일정 시작 날짜';
COMMENT ON COLUMN user_schedules.us_endDay IS '일정 종료 날짜';
COMMENT ON COLUMN user_schedules.us_startTime IS '일정 시작 시간';
COMMENT ON COLUMN user_schedules.us_endTime IS '일정 종료 시간';
COMMENT ON COLUMN user_schedules.us_location IS '일정 장소';
COMMENT ON COLUMN user_schedules.us_attendees IS '참석자 목록';
COMMENT ON COLUMN user_schedules.us_reminderSettings IS '알림 설정(JSON)';
COMMENT ON COLUMN user_schedules.us_isRecurring IS '반복 일정 여부';
COMMENT ON COLUMN user_schedules.us_recurrencePattern IS '반복 패턴 (DAILY, WEEKLY, MONTHLY, YEARLY)';
COMMENT ON COLUMN user_schedules.us_recurrenceEndDate IS '반복 종료 날짜';
COMMENT ON COLUMN user_schedules.us_createdAt IS '일정 생성 시각';
COMMENT ON COLUMN user_schedules.us_updatedAt IS '일정 최종 수정 시각';
COMMENT ON COLUMN user_schedules.us_deletedAt IS '일정 삭제 시각';
COMMENT ON COLUMN user_schedules.us_isDeleted IS '삭제 여부';

-- 인덱스 설계 (월/주/오늘 조회 최적화)
-- 사용자별 조회 빠르게
CREATE INDEX idx_user_schedules_userid
    ON user_schedules (us_userid);

-- 특정 날짜 범위 조회 (월/주 조회)
CREATE INDEX idx_user_schedules_startday
    ON user_schedules (us_startDay);

CREATE INDEX idx_user_schedules_endday
    ON user_schedules (us_endDay);

-- 사용자+시작일 복합 인덱스 (월/주 조회 최적화)
CREATE INDEX idx_user_schedules_userid_startday
    ON user_schedules (us_userid, us_startDay);

-- 삭제 여부 필터링
CREATE INDEX idx_user_schedules_isdeleted
    ON user_schedules (us_isDeleted);

-- 다운그레이드 (롤백용)
-- DROP TABLE IF EXISTS user_schedules CASCADE;
-- DROP TYPE IF EXISTS recurrence_pattern;
-- DROP TYPE IF EXISTS schedule_category;