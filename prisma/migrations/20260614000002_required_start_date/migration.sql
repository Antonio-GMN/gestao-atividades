/*
  Warnings:

  - Made the column `startDate` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill existing NULL startDate values
UPDATE "Task" SET "startDate" = NOW() WHERE "startDate" IS NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "startDate" SET NOT NULL;
