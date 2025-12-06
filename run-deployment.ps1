# Simple PowerShell script to upload and run deployment

$EC2_IP = "157.175.168.29"
$SSH_KEY = "C:\Users\TestUser\Desktop\aws\charity-key.pem"
$SSH_USER = "ubuntu"

Write-Host "🚀 EC2 Deployment Started" -ForegroundColor Cyan
Write-Host ""

# Upload deployment script
Write-Host "📤 Uploading deployment script..." -ForegroundColor Yellow
scp -i $SSH_KEY -o StrictHostKeyChecking=no ec2-deploy.sh "${SSH_USER}@${EC2_IP}:~/"

# Make script executable and execute
Write-Host "▶️  Executing deployment (this will take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host ""
ssh -i $SSH_KEY $SSH_USER@$EC2_IP "chmod +x ~/ec2-deploy.sh"
ssh -i $SSH_KEY $SSH_USER@$EC2_IP "~/ec2-deploy.sh"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is live at: http://$EC2_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Useful Commands:" -ForegroundColor Yellow
Write-Host "  ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP" -ForegroundColor Gray
Write-Host "  pm2 logs charity-app" -ForegroundColor Gray
Write-Host "  pm2 status" -ForegroundColor Gray
Write-Host ""

