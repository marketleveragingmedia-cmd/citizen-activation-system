-- AlterTable
ALTER TABLE "founders_beta" ADD COLUMN "companyName" TEXT,
ADD COLUMN "subdomainOption1" TEXT,
ADD COLUMN "subdomainOption2" TEXT,
ADD COLUMN "casAccountCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "casAccountCreatedAt" TIMESTAMP(3),
ADD COLUMN "casAdminId" TEXT;
