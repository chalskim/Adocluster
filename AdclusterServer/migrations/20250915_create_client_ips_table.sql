-- Migration: Create client_ips table
-- Created: 2025-09-15

-- Upgrade
CREATE TABLE "client_ips" (
    "id" SERIAL PRIMARY KEY,
    "ip_address" VARCHAR(45) UNIQUE NOT NULL,
    "user_agent" TEXT,
    "first_seen" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "access_count" INTEGER DEFAULT 1,
    "country" VARCHAR(100),
    "city" VARCHAR(100)
);

CREATE INDEX idx_client_ips_ip_address ON "client_ips"("ip_address");
CREATE INDEX idx_client_ips_last_seen ON "client_ips"("last_seen");

-- Rollback
-- DROP TABLE IF EXISTS "client_ips" CASCADE;