/*
  Warnings:

  - Made the column `requesterPhone` on table `requests` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "requesterPhone" SET NOT NULL;
