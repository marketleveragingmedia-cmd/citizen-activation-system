-- Reactivate demo account for testing Press Play page
-- Run this in the Neon database console or via Prisma Studio

UPDATE "Admin" 
SET status = 'Active'
WHERE subdomain = 'demo' 
  AND email = 'mzsamantha01+demo@gmail.com';

-- Verify the update
SELECT subdomain, "firstName", "lastName", email, status, "accountType"
FROM "Admin"
WHERE subdomain = 'demo';
