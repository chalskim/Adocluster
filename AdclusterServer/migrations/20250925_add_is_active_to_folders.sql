-- 마이그레이션: Add is_active column to folders table
-- 생성 시간: 2025-09-25

-- 업그레이드
-- Add is_active column to folders table
ALTER TABLE "folders" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT TRUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "idx_folders_is_active" ON "folders" ("is_active");

-- 다운그레이드 (롤백용)
-- DROP INDEX IF EXISTS "idx_folders_is_active";
-- ALTER TABLE "folders" DROP COLUMN IF EXISTS "is_active";