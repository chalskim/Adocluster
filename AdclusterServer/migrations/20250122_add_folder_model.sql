-- 마이그레이션: Add folder model
-- 생성 시간: 2025-01-22

-- 업그레이드
-- Create folders table
CREATE TABLE IF NOT EXISTS "folders" (
    "folderid" SERIAL PRIMARY KEY,
    "foldername" VARCHAR(255) NOT NULL,
    "folderdescription" TEXT,
    "projectid" UUID NOT NULL,
    "creatorid" UUID NOT NULL,
    "parentfolderid" INTEGER,
    "foldercreated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "folderupdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "folderorder" INTEGER DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT "fk_folders_project" FOREIGN KEY ("projectid") REFERENCES "projects" ("prjid") ON DELETE CASCADE,
    CONSTRAINT "fk_folders_creator" FOREIGN KEY ("creatorid") REFERENCES "users" ("uid") ON DELETE CASCADE,
    CONSTRAINT "fk_folders_parent" FOREIGN KEY ("parentfolderid") REFERENCES "folders" ("folderid") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_folders_project" ON "folders" ("projectid");
CREATE INDEX IF NOT EXISTS "idx_folders_creator" ON "folders" ("creatorid");
CREATE INDEX IF NOT EXISTS "idx_folders_parent" ON "folders" ("parentfolderid");
CREATE INDEX IF NOT EXISTS "idx_folders_order" ON "folders" ("projectid", "folderorder");

-- 다운그레이드 (롤백용)
-- DROP TABLE IF EXISTS "folders";