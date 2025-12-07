#!/bin/bash
# Deploy Bilingual Al-Khair Charity Platform to AWS EC2
# This merges the Next.js Arabic site with English content from charity-app

set -e

echo "🌍 Deploying Bilingual Charity Platform to EC2"
echo "=============================================="

# EC2 Configuration
EC2_IP="157.175.168.29"
SSH_USER="ubuntu"
SSH_KEY="C:\Users\TestUser\Desktop\aws\charity-key.pem"

echo ""
echo "1️⃣ Updating EC2 server with latest code..."
ssh -i "$SSH_KEY" $SSH_USER@$EC2_IP << 'ENDSSH'
cd ~/khair
git pull origin master
cd charity-app/backend
pm2 restart charity-app || pm2 start src/server.js --name charity-app
pm2 save
echo "✅ Server updated"
ENDSSH

echo ""
echo "2️⃣ Checking deployment status..."
ssh -i "$SSH_KEY" $SSH_USER@$EC2_IP "pm2 status"

echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🌐 Access your bilingual site:"
echo "   Main site: http://157.175.168.29"
echo "   API Health: http://157.175.168.29:5000/api/health"
echo ""
echo "📝 Features:"
echo "   ✅ Arabic content (main Next.js app)"
echo "   ✅ English charity pages"
echo "   ✅ Language switcher"
echo "   ✅ Dual language support"
echo ""

