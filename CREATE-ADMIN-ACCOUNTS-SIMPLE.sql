-- =====================================================
-- CREATE MASTER ADMIN AND MAIN ADMIN ACCOUNTS
-- Run this ENTIRE script in Vercel Postgres Dashboard
-- All steps will execute in order automatically
-- =====================================================

-- Step 1: Create MASTER_ADMIN
WITH master_admin AS (
  INSERT INTO "Admin" (
    id,
    role,
    "firstName",
    "lastName",
    email,
    "passwordHash",
    status,
    "teamId",
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'MASTER_ADMIN',
    'Samantha',
    'Master',
    'mzsamantha01+master@gmail.com',
    '$2b$10$Nlh3aTdW142QNFuglOerw.vCpZ/guU8qil9MLLxNVrqtnfvs9sDOu',
    'Active',
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id, email, role
)
SELECT * FROM master_admin;

-- Step 2: Create team and main admin together
WITH new_team AS (
  INSERT INTO "Team" (
    id,
    name,
    "adminId",
    "tierType",
    "autoAssignEnabled",
    status,
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Samantha''s Business Network',
    'temp-placeholder',
    'FullSystem',
    true,
    'Active',
    NOW(),
    NOW()
  )
  RETURNING id
),
new_admin AS (
  INSERT INTO "Admin" (
    id,
    role,
    "firstName",
    "lastName",
    email,
    "passwordHash",
    status,
    "teamId",
    "createdAt",
    "updatedAt"
  )
  SELECT
    gen_random_uuid(),
    'MAIN_ADMIN',
    'Samantha',
    'Main',
    'mzsamantha01+main@gmail.com',
    '$2b$10$ErBk2Ub1Bm3yhZjTNmU/uebOXf3/7FchVrSb/QwhVWSRl.kRAX0Ju',
    'Active',
    id,
    NOW(),
    NOW()
  FROM new_team
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id, "teamId"
)
UPDATE "Team"
SET "adminId" = new_admin.id
FROM new_admin
WHERE "Team".id = new_admin."teamId"
RETURNING "Team".id as team_id, "Team".name as team_name, new_admin.id as admin_id;

-- Step 3: Verify all accounts
SELECT 
  email, 
  role, 
  "firstName", 
  "lastName", 
  status, 
  "teamId",
  "createdAt"
FROM "Admin"
WHERE email LIKE '%mzsamantha01%'
ORDER BY email;

-- =====================================================
-- LOGIN CREDENTIALS
-- =====================================================
-- 
-- MASTER ADMIN:
--   Email: mzsamantha01+master@gmail.com
--   Password: MasterAdmin2026!
--   Role: MASTER_ADMIN
--
-- YOUR MAIN ADMIN:
--   Email: mzsamantha01+main@gmail.com
--   Password: MainAdmin2026!
--   Role: MAIN_ADMIN
--
-- DEMO ACCOUNT (unchanged):
--   Email: mzsamantha01@gmail.com
--   Password: ChangeMe123!
--   Role: MAIN_ADMIN
--
-- Login URL: https://hub.citizenactivation.com/login
-- ⚠️  CHANGE ALL PASSWORDS AFTER FIRST LOGIN
--
-- =====================================================
