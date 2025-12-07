# Deploy Bilingual Al-Khair Charity Platform to AWS EC2 (PowerShell)
# This merges the Next.js Arabic site with English content from charity-app

$ErrorActionPreference = "Stop"

Write-Host "🌍 Deploying Bilingual Charity Platform to EC2" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# EC2 Configuration
$EC2_IP = "157.175.168.29"
$SSH_USER = "ubuntu"
$SSH_KEY = "C:\Users\TestUser\Desktop\aws\charity-key.pem"

Write-Host ""
Write-Host "1 Updating EC2 server with latest code..." -ForegroundColor Yellow

# Update code and restart server
ssh -i $SSH_KEY "$SSH_USER@$EC2_IP" @"
cd ~/khair &&
git pull origin master &&
cd charity-app/backend &&
(pm2 restart charity-app || pm2 start src/server.js --name charity-app) &&
pm2 save &&
echo 'Server updated'
"@

Write-Host ""
Write-Host "2 Checking deployment status..." -ForegroundColor Yellow
ssh -i $SSH_KEY "$SSH_USER@$EC2_IP" "pm2 status"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your bilingual site:" -ForegroundColor Cyan
Write-Host "   Main site: http://157.175.168.29" -ForegroundColor White
Write-Host "   API Health: http://157.175.168.29:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Cyan
Write-Host "   Arabic content (main Next.js app)" -ForegroundColor White
Write-Host "   English charity pages" -ForegroundColor White
Write-Host "   Language switcher" -ForegroundColor White
Write-Host "   Dual language support" -ForegroundColor White
Write-Host ""

