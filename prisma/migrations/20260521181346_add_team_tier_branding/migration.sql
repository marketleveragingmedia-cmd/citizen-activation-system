-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "TierType" AS ENUM ('FullSystem', 'SoloOrg');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "tierType" "TierType" NOT NULL DEFAULT 'FullSystem',
ADD COLUMN IF NOT EXISTS "customDomain" TEXT,
ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
