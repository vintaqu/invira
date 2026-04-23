-- AlterTable: Add menuJson to Event
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "menuJson" JSONB;
