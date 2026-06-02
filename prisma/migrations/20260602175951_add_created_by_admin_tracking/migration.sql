-- AlterTable
ALTER TABLE "teams" ADD COLUMN "createdByAdminId" TEXT;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
