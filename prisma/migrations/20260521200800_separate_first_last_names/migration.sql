-- Separate First & Last Names Migration
-- Generated: May 21, 2026

-- Step 1: Add new firstName and lastName columns to admins table
ALTER TABLE "admins" ADD COLUMN "firstName" TEXT;
ALTER TABLE "admins" ADD COLUMN "lastName" TEXT;

-- Step 2: Migrate existing data (split name into firstName and lastName)
UPDATE "admins"
SET 
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName" = CASE 
    WHEN POSITION(' ' IN "name") > 0 
    THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE ''
  END;

-- Step 3: Make columns NOT NULL after data migration
ALTER TABLE "admins" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "admins" ALTER COLUMN "lastName" SET NOT NULL;

-- Step 4: Drop old name column
ALTER TABLE "admins" DROP COLUMN "name";

-- Step 5: Add new firstName and lastName columns to strategic_partners table
ALTER TABLE "strategic_partners" ADD COLUMN "firstName" TEXT;
ALTER TABLE "strategic_partners" ADD COLUMN "lastName" TEXT;

-- Step 6: Migrate existing data
UPDATE "strategic_partners"
SET 
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName" = CASE 
    WHEN POSITION(' ' IN "name") > 0 
    THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE ''
  END;

-- Step 7: Make columns NOT NULL
ALTER TABLE "strategic_partners" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "strategic_partners" ALTER COLUMN "lastName" SET NOT NULL;

-- Step 8: Drop old name column
ALTER TABLE "strategic_partners" DROP COLUMN "name";

-- Step 9: Add new firstName and lastName columns to requests table
ALTER TABLE "requests" ADD COLUMN "requesterFirstName" TEXT;
ALTER TABLE "requests" ADD COLUMN "requesterLastName" TEXT;

-- Step 10: Migrate existing data
UPDATE "requests"
SET 
  "requesterFirstName" = SPLIT_PART("requesterName", ' ', 1),
  "requesterLastName" = CASE 
    WHEN POSITION(' ' IN "requesterName") > 0 
    THEN SUBSTRING("requesterName" FROM POSITION(' ' IN "requesterName") + 1)
    ELSE ''
  END;

-- Step 11: Make columns NOT NULL
ALTER TABLE "requests" ALTER COLUMN "requesterFirstName" SET NOT NULL;
ALTER TABLE "requests" ALTER COLUMN "requesterLastName" SET NOT NULL;

-- Step 12: Drop old requesterName column
ALTER TABLE "requests" DROP COLUMN "requesterName";
