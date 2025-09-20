-- 마이그레이션: mylib schema update
-- 생성 시간: 2025-09-20

-- 업그레이드
-- Rename columns in mylib table to match model
ALTER TABLE "mylib" RENAME COLUMN "mlID" TO "libID";
ALTER TABLE "mylib" RENAME COLUMN "mlTitle" TO "libName";
ALTER TABLE "mylib" RENAME COLUMN "uid" TO "libOwnerID";
ALTER TABLE "mylib" RENAME COLUMN "created_at" TO "libCreated";
ALTER TABLE "mylib" RENAME COLUMN "updated_at" TO "libUpdated";

-- Add missing columns to mylib table
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libDescription" TEXT;

-- Rename columns in mylibitems table to match model
ALTER TABLE "mylibitems" RENAME COLUMN "item_id" TO "itemID";
ALTER TABLE "mylibitems" RENAME COLUMN "mlID" TO "libID";
ALTER TABLE "mylibitems" RENAME COLUMN "item_type" TO "itemType";
ALTER TABLE "mylibitems" RENAME COLUMN "title" TO "itemTitle";
ALTER TABLE "mylibitems" RENAME COLUMN "created_at" TO "itemCreated";
ALTER TABLE "mylibitems" RENAME COLUMN "updated_at" TO "itemUpdated";

-- Add missing columns to mylibitems table
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemAuthor" VARCHAR(255);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemPublisher" VARCHAR(255);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemYear" VARCHAR(10);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemURL" TEXT;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemDOI" VARCHAR(100);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemISBN" VARCHAR(20);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemISSN" VARCHAR(20);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemVolume" VARCHAR(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemIssue" VARCHAR(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemPages" VARCHAR(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemAbstract" TEXT;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemKeywords" TEXT;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemNotes" TEXT;

-- Update indexes
DROP INDEX IF EXISTS idx_mylib_uid;
DROP INDEX IF EXISTS idx_mylibitems_mlID;

CREATE INDEX idx_mylib_libOwnerID ON mylib("libOwnerID");
CREATE INDEX idx_mylibitems_libID ON mylibitems("libID");

-- 롤백 (필요시)
-- ALTER TABLE "mylib" RENAME COLUMN "libID" TO "mlID";
-- ALTER TABLE "mylib" RENAME COLUMN "libName" TO "mlTitle";
-- ALTER TABLE "mylib" RENAME COLUMN "libOwnerID" TO "uid";
-- ALTER TABLE "mylib" RENAME COLUMN "libCreated" TO "created_at";
-- ALTER TABLE "mylib" RENAME COLUMN "libUpdated" TO "updated_at";
-- ALTER TABLE "mylib" DROP COLUMN IF EXISTS "libDescription";

-- ALTER TABLE "mylibitems" RENAME COLUMN "itemID" TO "item_id";
-- ALTER TABLE "mylibitems" RENAME COLUMN "libID" TO "mlID";
-- ALTER TABLE "mylibitems" RENAME COLUMN "itemType" TO "item_type";
-- ALTER TABLE "mylibitems" RENAME COLUMN "itemTitle" TO "title";
-- ALTER TABLE "mylibitems" RENAME COLUMN "itemCreated" TO "created_at";
-- ALTER TABLE "mylibitems" RENAME COLUMN "itemUpdated" TO "updated_at";

-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemAuthor";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemPublisher";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemYear";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemURL";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemDOI";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemISBN";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemISSN";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemVolume";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemIssue";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemPages";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemAbstract";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemKeywords";
-- ALTER TABLE "mylibitems" DROP COLUMN IF EXISTS "itemNotes";

-- DROP INDEX IF EXISTS idx_mylib_libOwnerID;
-- DROP INDEX IF EXISTS idx_mylibitems_libID;

-- CREATE INDEX idx_mylib_uid ON mylib("uid");
-- CREATE INDEX idx_mylibitems_mlID ON mylibitems("mlID");