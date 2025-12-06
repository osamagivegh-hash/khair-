# EC2 Deployment Script - Final Version
# Properly formatted for PowerShell

$EC2_IP = "157.175.168.29"
$SSH_KEY = "C:\Users\TestUser\Desktop\aws\charity-key.pem"
$SSH_USER = "ubuntu"

Write-Host "🚀 EC2 Deployment - Charity App" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$testResult = ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSH_USER@$EC2_IP "echo 'Connected'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SSH connection failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH Connected!`n" -ForegroundColor Green

# Create deployment script content as a single line bash command
$command = 'bash -c "set -e; echo \"1️⃣ Updating system...\"; sudo apt-get update -y; echo \"2️⃣ Installing Node.js...\"; curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -; sudo apt-get install -y nodejs; echo \"3️⃣ Installing packages...\"; sudo apt-get install -y git nginx; sudo npm install -g pm2; echo \"4️⃣ Cloning repo...\"; rm -rf khair; git clone https://github.com/osamagivegh-hash/khair.git khair; echo \"5️⃣ Backend setup...\"; cd khair/charity-app/backend && npm install; echo \"6️⃣ Frontend build...\"; cd ../frontend && npm install && npm run build; echo \"7️⃣ Deploy frontend...\"; cd .. && mkdir -p backend/public && cp -r frontend/build/* backend/public/; echo \"8️⃣ Create .env...\"; echo \\\"MONGODB_URI=mongodb://localhost:27017/charity-app\\nPORT=5000\\nNODE_ENV=production\\nCORS_ORIGIN=*\\\" > backend/.env; echo \"9️⃣ Start PM2...\"; cd backend && pm2 delete charity-app 2>/dev/null; pm2 start src/server.js --name charity-app; pm2 save; echo \"🔟 Configure Nginx...\"; echo \\\"server { listen 80; server_name _; location / { proxy_pass http://localhost:5000; proxy_http_version 1.1; proxy_set_header Upgrade \\\$http_upgrade; proxy_set_header Connection 'upgrade'; proxy_set_header Host \\\$host; proxy_set_header X-Real-IP \\\$remote_addr; proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for; proxy_cache_bypass \\\$http_upgrade; } }\\\" | sudo tee /etc/nginx/sites-available/default; sudo nginx -t; sudo systemctl restart nginx; sudo systemctl enable nginx; echo \\\"\\\"; echo \\\"✅ DEPLOYMENT COMPLETE!\\\"; echo \\\"\\\"; pm2 status"'

Write-Host "📦 Running deployment on EC2 (this may take 5-10 minutes)...`n" -ForegroundColor Yellow

ssh -i $SSH_KEY $SSH_USER@$EC2_IP $command

Write-Host "`n================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "🌐 Your application is live at:" -ForegroundColor Yellow
Write-Host "   http://$EC2_IP`n" -ForegroundColor Cyan

Write-Host "📊 Management Commands:" -ForegroundColor Yellow
Write-Host "   View logs:    ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP `"pm2 logs charity-app`"" -ForegroundColor Gray
Write-Host "   Check status: ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP `"pm2 status`"" -ForegroundColor Gray
Write-Host "   Restart app:  ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP `"pm2 restart charity-app`"" -ForegroundColor Gray
Write-Host ""

