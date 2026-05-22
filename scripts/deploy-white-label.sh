#!/bin/bash

# White-Label Deployment Script
# Usage: ./deploy-white-label.sh <customer-name> <customer-domain> <customer-email>

set -e

CUSTOMER_NAME="$1"
CUSTOMER_DOMAIN="$2"
CUSTOMER_EMAIL="$3"
CUSTOMER_LOGO="${4:-}" # Optional

if [ -z "$CUSTOMER_NAME" ] || [ -z "$CUSTOMER_DOMAIN" ] || [ -z "$CUSTOMER_EMAIL" ]; then
  echo "❌ Usage: ./deploy-white-label.sh <customer-name> <customer-domain> <customer-email> [logo-url]"
  echo "Example: ./deploy-white-label.sh 'ABC Company' 'hub.abccompany.com' 'admin@abccompany.com' 'https://abccompany.com/logo.png'"
  exit 1
fi

echo "🚀 White-Label Deployment Script"
echo "================================"
echo "Customer: $CUSTOMER_NAME"
echo "Domain: $CUSTOMER_DOMAIN"
echo "Admin Email: $CUSTOMER_EMAIL"
echo "Logo: ${CUSTOMER_LOGO:-'None'}"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

# Step 1: Create Neon database
echo "📊 Step 1: Create Neon PostgreSQL database..."
echo "👉 Manual step: Go to https://console.neon.tech"
echo "   - Create new project: ${CUSTOMER_NAME}"
echo "   - Copy connection string"
echo ""
echo "Paste connection string here:"
read DATABASE_URL

# Step 2: Clone repository
echo ""
echo "📦 Step 2: Creating deployment directory..."
DEPLOY_DIR="/tmp/white-label-${CUSTOMER_NAME// /-}"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Copy source files (assumes script runs from project root)
cp -r /root/.openclaw/workspace/citizen-activation-system/* .

# Step 3: Configure environment
echo ""
echo "⚙️ Step 3: Configuring environment..."

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
CRON_SECRET=$(openssl rand -base64 32)

# Create .env.local
cat > .env.local << EOF
# White-Label Environment Configuration
# Customer: $CUSTOMER_NAME
# Generated: $(date)

DATABASE_URL="$DATABASE_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://$CUSTOMER_DOMAIN"
RESEND_API_KEY="re_Z4SzEvLF_8VY6gsZHVmTWmSk97NjgHQXf"
CRON_SECRET="$CRON_SECRET"
WHITE_LABEL_MODE="true"
WHITE_LABEL_CUSTOMER="$CUSTOMER_NAME"
WHITE_LABEL_LOGO="$CUSTOMER_LOGO"
EOF

echo "✅ Environment configured"

# Step 4: Run database migrations
echo ""
echo "🗄️ Step 4: Running database migrations..."
export DATABASE_URL="$DATABASE_URL"
npx prisma generate
npx prisma migrate deploy
echo "✅ Database migrations complete"

# Step 5: Create Main Admin account
echo ""
echo "👤 Step 5: Creating Main Admin account..."
TEMP_PASSWORD=$(openssl rand -base64 12)

node << EOFNODE
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function setup() {
  // Create team
  const team = await prisma.team.create({
    data: {
      name: '$CUSTOMER_NAME',
      adminId: 'pending',
      tierType: 'FullSystem',
      logoUrl: '$CUSTOMER_LOGO',
      status: 'Active'
    }
  });

  // Create Main Admin
  const hashedPassword = await bcrypt.hash('$TEMP_PASSWORD', 10);
  const admin = await prisma.admin.create({
    data: {
      teamId: team.id,
      name: '$CUSTOMER_NAME Admin',
      email: '$CUSTOMER_EMAIL',
      passwordHash: hashedPassword,
      role: 'MAIN_ADMIN',
      status: 'Active'
    }
  });

  // Update team adminId
  await prisma.team.update({
    where: { id: team.id },
    data: { adminId: admin.id }
  });

  console.log('✅ Main Admin created');
  console.log('   Email: $CUSTOMER_EMAIL');
  console.log('   Password: $TEMP_PASSWORD');

  await prisma.\$disconnect();
}

setup();
EOFNODE

# Step 6: Deploy to Vercel
echo ""
echo "☁️ Step 6: Deploying to Vercel..."
echo "👉 Manual steps:"
echo "   1. Go to https://vercel.com"
echo "   2. Import this directory: $DEPLOY_DIR"
echo "   3. Set environment variables from .env.local"
echo "   4. Deploy to production"
echo "   5. Add custom domain: $CUSTOMER_DOMAIN"
echo ""
echo "Vercel environment variables to add:"
cat .env.local
echo ""

# Step 7: Send credentials email
echo ""
echo "📧 Step 7: Send login credentials to customer"
echo ""
echo "Email template:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To: $CUSTOMER_EMAIL"
echo "Subject: Your Citizen Activation System is Ready!"
echo ""
echo "Hello,"
echo ""
echo "Your White-Label Citizen Activation System is now live!"
echo ""
echo "🔗 Login URL: https://$CUSTOMER_DOMAIN/login"
echo "📧 Email: $CUSTOMER_EMAIL"
echo "🔑 Temporary Password: $TEMP_PASSWORD"
echo ""
echo "Please login and change your password immediately."
echo ""
echo "You can now:"
echo "• Add Strategic Partners"
echo "• Share your public request form: https://$CUSTOMER_DOMAIN"
echo "• Manage MOSCA invitation requests"
echo ""
echo "Support: marketleveragingmedia@agentmail.to"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 8: Summary
echo "✅ WHITE-LABEL DEPLOYMENT COMPLETE!"
echo ""
echo "📋 Summary:"
echo "   Customer: $CUSTOMER_NAME"
echo "   Domain: $CUSTOMER_DOMAIN"
echo "   Admin Email: $CUSTOMER_EMAIL"
echo "   Temp Password: $TEMP_PASSWORD"
echo "   Deployment Directory: $DEPLOY_DIR"
echo ""
echo "🎯 Next Steps:"
echo "   1. Complete Vercel deployment (manual)"
echo "   2. Configure DNS for $CUSTOMER_DOMAIN"
echo "   3. Send credentials email to customer"
echo "   4. Test login and functionality"
echo ""
echo "💰 Customer Payment:"
echo "   One-time: \$1,997 (or \$2,997)"
echo "   Annual: \$497/year"
echo ""
