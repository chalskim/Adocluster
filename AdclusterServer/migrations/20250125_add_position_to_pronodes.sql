-- 마이그레이션: Add position column to proNodes table
-- 생성일: 2025-01-25
-- 설명: proNodes 테이블에 position 컬럼을 추가하여 트리 노드의 순서를 관리

-- Add position column to proNodes table
ALTER TABLE "proNodes" ADD COLUMN IF NOT EXISTS "position" INTEGER DEFAULT 0;

-- Create index for better performance when ordering by position
CREATE INDEX IF NOT EXISTS "idx_pronodes_position" ON "proNodes" ("prjID", "prjID_parents", "position");

-- Rollback commands (주석 처리됨)
-- DROP INDEX IF EXISTS "idx_pronodes_position";
-- ALTER TABLE "proNodes" DROP COLUMN IF EXISTS "position";