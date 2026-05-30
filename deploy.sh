#!/bin/bash
# One-Command Vercel Deployment
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Citizen Activation System to Vercel..."
echo ""

# Load Vercel token
VERCEL_TOKEN=$(cat /root/.openclaw/workspace/mlm-command-center/credentials/vercel-token.txt | grep -v "^#" | tail -1)
DEPLOY_HOOK="https://api.vercel.com/v1/integrations/deploy/prj_WOC6lzkUMTH2YQhiDFM8PQNAq5VB/uZkd117edF"

# Trigger deployment
echo "📤 Triggering deployment via Vercel API..."
RESPONSE=$(curl -s -X POST "$DEPLOY_HOOK")

# Parse response
JOB_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo "❌ Deployment failed to trigger"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Deployment triggered successfully!"
echo "📋 Job ID: $JOB_ID"
echo ""
echo "⏳ Building... (this takes 3-5 minutes)"
echo ""
echo "📊 Check status at:"
echo "   https://vercel.com/marketleveragingmedia-cmds-projects/citizen-activation-hub/deployments"
echo ""
echo "🔗 Live site:"
echo "   https://hub.citizenactivation.com"
echo ""
echo "✅ Done! Deployment is in progress."
echo ""
echo "💡 Tip: You can close this terminal. Deployment continues in background."
