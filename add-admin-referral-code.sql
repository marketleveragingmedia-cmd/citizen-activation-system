-- Add referralCode column to admins table
ALTER TABLE "admins" ADD COLUMN "referralCode" TEXT;

-- Add unique constraint
CREATE UNIQUE INDEX "admins_referralCode_key" ON "admins"("referralCode") WHERE "referralCode" IS NOT NULL;
