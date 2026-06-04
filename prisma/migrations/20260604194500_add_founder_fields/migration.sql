-- Add Founder fields to Admin table
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "isFounder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "founderDate" TIMESTAMP(3);
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "founderPaymentMethod" TEXT;
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "founderPaymentDetails" TEXT;
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "moscaCode" TEXT;

-- Create FounderPending table
CREATE TABLE IF NOT EXISTS "founders_pending" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "moscaCode" TEXT NOT NULL,
    "subdomainOption1" TEXT NOT NULL,
    "subdomainOption2" TEXT NOT NULL,
    "walletInfo" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MOSCA',
    "manualPaymentType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "submittedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "approvedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founders_pending_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for FounderPending
ALTER TABLE "founders_pending" ADD CONSTRAINT "founders_pending_approvedByAdminId_fkey" 
    FOREIGN KEY ("approvedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
