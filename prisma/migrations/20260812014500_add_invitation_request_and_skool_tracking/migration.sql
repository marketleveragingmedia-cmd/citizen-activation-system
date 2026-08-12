-- AlterTable
ALTER TABLE "founders_beta" ADD COLUMN "invitationRequestCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "invitationRequestCompletedAt" TIMESTAMP(3),
ADD COLUMN "skoolCommunityAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "skoolCommunityAddedAt" TIMESTAMP(3),
ADD COLUMN "globalControlContactId" TEXT,
ADD COLUMN "globalControlSynced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "globalControlLastSyncedAt" TIMESTAMP(3);
