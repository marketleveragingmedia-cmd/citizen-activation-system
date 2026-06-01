-- AlterTable
ALTER TABLE "teams" ADD COLUMN "organizationName" TEXT,
ADD COLUMN "welcomeMessage" TEXT,
ADD COLUMN "primaryColor" TEXT,
ADD COLUMN "secondaryColor" TEXT,
ADD COLUMN "emailFromName" TEXT,
ADD COLUMN "hidePlatformBranding" BOOLEAN NOT NULL DEFAULT false;
