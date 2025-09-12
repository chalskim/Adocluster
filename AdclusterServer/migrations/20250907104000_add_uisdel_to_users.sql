-- 마이그레이션: add_uisdel_to_users
-- 생성 시간: 2025-09-07 10:40:00

-- 업그레이드
ALTER TABLE users ADD COLUMN uisdel BOOLEAN DEFAULT FALSE;

-- Index for uisdel for faster lookups
CREATE INDEX idx_users_uisdel ON users (uisdel);

-- 롤백
-- DROP INDEX IF EXISTS idx_users_uisdel;
-- ALTER TABLE users DROP COLUMN IF EXISTS uisdel;