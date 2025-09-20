-- 마이그레이션: mylib schema fix
-- 생성 시간: 2025-09-20

-- 업그레이드
-- Add missing columns to mylib table
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libID" uuid;
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libName" varchar(100);
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libDescription" text;
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libCreated" timestamp with time zone;
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libUpdated" timestamp with time zone;
ALTER TABLE "mylib" ADD COLUMN IF NOT EXISTS "libOwnerID" uuid;

-- Add missing columns to mylibitems table
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemID" uuid;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "libID" uuid;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemType" varchar(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemTitle" varchar(255);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemAuthor" varchar(255);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemPublisher" varchar(255);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemYear" varchar(10);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemDOI" varchar(100);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemISBN" varchar(20);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemISSN" varchar(20);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemVolume" varchar(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemIssue" varchar(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemPages" varchar(50);
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemAbstract" text;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemKeywords" text;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemNotes" text;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemCreated" timestamp with time zone;
ALTER TABLE "mylibitems" ADD COLUMN IF NOT EXISTS "itemUpdated" timestamp with time zone;

-- Copy data from old columns to new columns
UPDATE "mylib" SET 
    "libID" = "mlid",
    "libName" = "mltitle",
    "libCreated" = "created_at",
    "libUpdated" = "updated_at";

UPDATE "mylibitems" SET 
    "itemID" = "item_id",
    "libID" = "mlid",
    "itemType" = "item_type",
    "itemTitle" = "title",
    "itemCreated" = "created_at",
    "itemUpdated" = "updated_at";

-- Set libOwnerID based on author field (this is a simplification)
-- In a real scenario, you would need to map author to actual user IDs
UPDATE "mylib" SET "libOwnerID" = "mlid"; -- Placeholder, should be replaced with actual user IDs

-- Add foreign key constraints
ALTER TABLE "mylib" ADD CONSTRAINT IF NOT EXISTS "fk_mylib_owner" FOREIGN KEY ("libOwnerID") REFERENCES "user"("uid");
ALTER TABLE "mylibitems" ADD CONSTRAINT IF NOT EXISTS "fk_mylibitems_lib" FOREIGN KEY ("libID") REFERENCES "mylib"("libID");

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_mylib_owner" ON "mylib"("libOwnerID");
CREATE INDEX IF NOT EXISTS "idx_mylibitems_lib" ON "mylibitems"("libID");

-- Drop old columns (optional, can be done later)
-- ALTER TABLE "mylib" DROP COLUMN "mlid";
-- ALTER TABLE "mylib" DROP COLUMN "mltitle";
-- ALTER TABLE "mylib" DROP COLUMN "type";
-- ALTER TABLE "mylib" DROP COLUMN "created_at";
-- ALTER TABLE "mylib" DROP COLUMN "updated_at";
-- ALTER TABLE "mylibitems" DROP COLUMN "item_id";
-- ALTER TABLE "mylibitems" DROP COLUMN "mlid";
-- ALTER TABLE "mylibitems" DROP COLUMN "item_type";
-- ALTER TABLE "mylibitems" DROP COLUMN "title";
-- ALTER TABLE "mylibitems" DROP COLUMN "created_at";
-- ALTER TABLE "mylibitems" DROP COLUMN "updated_at";