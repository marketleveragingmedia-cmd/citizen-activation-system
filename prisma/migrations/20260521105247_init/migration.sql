-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MAIN_ADMIN', 'TEAM_ADMIN');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('Active', 'Paused', 'Full');

-- CreateEnum
CREATE TYPE "ActivationLevel" AS ENUM ('Citizen', 'Enterprise');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('Auto', 'Manual', 'Referral');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Assigned', 'Invited', 'OnboardingScheduled', 'Activated');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEAM_ADMIN',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "teamId" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "status" "AdminStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "autoAssignEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TeamStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_partners" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "referralCode" TEXT NOT NULL,
    "slotsUsed" INTEGER NOT NULL DEFAULT 0,
    "slotsAvailable" INTEGER NOT NULL DEFAULT 3,
    "status" "PartnerStatus" NOT NULL DEFAULT 'Active',
    "lastAssigned" TIMESTAMP(3),
    "totalAssigned" INTEGER NOT NULL DEFAULT 0,
    "activationLevel" "ActivationLevel" NOT NULL,
    "activationDate" TIMESTAMP(3),
    "originalRequestId" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategic_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "referralCodeUsed" TEXT,
    "activationLevel" "ActivationLevel" NOT NULL,
    "assignedPartnerId" TEXT,
    "assignmentType" "AssignmentType" NOT NULL DEFAULT 'Auto',
    "status" "RequestStatus" NOT NULL DEFAULT 'Assigned',
    "dateSubmitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateAssigned" TIMESTAMP(3),
    "dateInvited" TIMESTAMP(3),
    "dateOnboardingScheduled" TIMESTAMP(3),
    "dateActivated" TIMESTAMP(3),
    "becamePartnerId" TEXT,
    "notes" TEXT,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_partners_email_key" ON "strategic_partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_partners_referralCode_key" ON "strategic_partners"("referralCode");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_partners" ADD CONSTRAINT "strategic_partners_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_partners" ADD CONSTRAINT "strategic_partners_originalRequestId_fkey" FOREIGN KEY ("originalRequestId") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_assignedPartnerId_fkey" FOREIGN KEY ("assignedPartnerId") REFERENCES "strategic_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_becamePartnerId_fkey" FOREIGN KEY ("becamePartnerId") REFERENCES "strategic_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
