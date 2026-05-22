-- Add Stripe Connect account ID to teams table
ALTER TABLE "teams" ADD COLUMN "stripeAccountId" TEXT;

-- Add unique constraint
ALTER TABLE "teams" ADD CONSTRAINT "teams_stripeAccountId_key" UNIQUE ("stripeAccountId");
