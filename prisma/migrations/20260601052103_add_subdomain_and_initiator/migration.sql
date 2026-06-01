-- AlterTable
ALTER TABLE "admins" ADD COLUMN "subdomain" TEXT;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN "initiatorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_subdomain_key" ON "admins"("subdomain");
