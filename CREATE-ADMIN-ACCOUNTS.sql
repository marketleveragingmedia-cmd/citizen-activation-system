-- =====================================================
-- CREATE MASTER ADMIN AND MAIN ADMIN ACCOUNTS
-- Run this in Vercel Postgres Dashboard
-- =====================================================

-- 1. CREATE MASTER ADMIN
-- Email: mzsamantha01+master@gmail.com
-- Password: MasterAdmin2026!
-- bcrypt hash for "MasterAdmin2026!": $2a$10$XZvLqZ9KpEe8qYH3nYhZvO7b4Y8wZp1qFQdJkLp1qJkLp1qJkLp1q

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
  '$2b$10$Nlh3aTdW142QNFuglOerw.vCpZ/guU8qil9MLLxNVrqtnfvs9sDOu', -- MasterAdmin2026!
  'Active',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;


-- 2. CREATE TEAM FOR YOUR MAIN ADMIN
-- This will create the team first, then we'll create the admin and link them

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
ON CONFLICT DO NOTHING
RETURNING id; -- Copy this ID for next step


-- 3. CREATE YOUR MAIN ADMIN
-- Email: mzsamantha01+main@gmail.com
-- Password: MainAdmin2026!
-- bcrypt hash for "MainAdmin2026!": $2a$10$mEe8qYH3nYhZvOYWL5gG8qZ9mEe8qYH3nYhZvOYWL5gG8qZ9mEe8qu

-- IMPORTANT: Replace 'TEAM_ID_FROM_STEP_2' with the actual team ID from step 2

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
  'MAIN_ADMIN',
  'Samantha',
  'Main',
  'mzsamantha01+main@gmail.com',
  '$2b$10$ErBk2Ub1Bm3yhZjTNmU/uebOXf3/7FchVrSb/QwhVWSRl.kRAX0Ju', -- MainAdmin2026!
  'Active',
  'TEAM_ID_FROM_STEP_2', -- Replace with actual team ID
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING id; -- Copy this ID for next step


-- 4. UPDATE TEAM WITH CORRECT ADMIN ID
-- IMPORTANT: Replace 'ADMIN_ID_FROM_STEP_3' with the actual admin ID from step 3
-- IMPORTANT: Replace 'TEAM_ID_FROM_STEP_2' with the actual team ID from step 2

UPDATE "Team"
SET "adminId" = 'ADMIN_ID_FROM_STEP_3'
WHERE id = 'TEAM_ID_FROM_STEP_2';


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all accounts
SELECT email, role, "firstName", "lastName", status, "teamId"
FROM "Admin"
WHERE email LIKE '%mzsamantha01%'
ORDER BY email;

-- Check teams
SELECT t.id, t.name, t."tierType", a.email as "adminEmail"
FROM "Team" t
LEFT JOIN "Admin" a ON t."adminId" = a.id
WHERE t.name LIKE '%Samantha%';


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
