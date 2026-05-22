-- AlterTable
ALTER TABLE "requests" ADD COLUMN "escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "escalatedDate" TIMESTAMP(3);
