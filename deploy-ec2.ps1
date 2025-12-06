# AWS EC2 Automated Deployment Script
# Deploy charity-app (React + Node.js) to EC2

$ErrorActionPreference = "Stop"

# Configuration
$EC2_IP = "157.175.168.29"
$SSH_USER = "ubuntu"
$SSH_KEY = "C:\Users\TestUser\Desktop\aws\charity-key.pem"
$REPO_URL = "https://github.com/osamagivegh-hash/khair.git"
$APP_PORT = 5000

Write-Host "🚀 Starting AWS EC2 Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "EC2 IP: $EC2_IP" -ForegroundColor Yellow
Write-Host "Project: charity-app (React + Node.js)" -ForegroundColor Yellow
Write-Host ""

# Function to run SSH command
function Invoke-SSHCommand {
    param (
        [string]$Command
    )
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP $Command
}

# Step 1: Test SSH Connection
Write-Host "📡 Step 1: Testing SSH connection..." -ForegroundColor Yellow
try {
    Invoke-SSHCommand "echo 'SSH connection successful' && uname -a"
    Write-Host "✅ SSH connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ SSH connection failed. Checking SSH key permissions..." -ForegroundColor Red
    icacls $SSH_KEY /inheritance:r /grant:r "${env:USERNAME}:R"
    Write-Host "SSH key permissions fixed. Please run the script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Update system and install dependencies
Write-Host ""
Write-Host "📦 Step 2: Preparing server (Node.js, nginx, pm2, git)..." -ForegroundColor Yellow

$SETUP_SCRIPT = @'
#!/bin/bash
set -e

echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing required packages..."
sudo apt-get install -y git nginx

echo "Installing PM2 globally..."
sudo npm install -g pm2

echo "Verifying installations..."
node --version
npm --version
git --version
nginx -v
pm2 --version

echo "Setup complete!"
'@

Invoke-SSHCommand "cat > setup.sh << 'EOFSETUP'`n$SETUP_SCRIPT`nEOFSETUP"
Invoke-SSHCommand "chmod +x setup.sh && ./setup.sh"
Write-Host "✅ Server prepared successfully!" -ForegroundColor Green

# Step 3: Clone project
Write-Host ""
Write-Host "📥 Step 3: Cloning project from GitHub..." -ForegroundColor Yellow
Invoke-SSHCommand "rm -rf khair && git clone $REPO_URL khair"
Write-Host "✅ Project cloned successfully!" -ForegroundColor Green

# Step 4: Install backend dependencies
Write-Host ""
Write-Host "📦 Step 4: Installing backend dependencies..." -ForegroundColor Yellow
Invoke-SSHCommand "cd khair/charity-app/backend && npm install"
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green

# Step 5: Install frontend dependencies and build
Write-Host ""
Write-Host "🏗️  Step 5: Building React frontend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd khair/charity-app/frontend && npm install && npm run build"
Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Step 6: Copy frontend build to backend
Write-Host ""
Write-Host "📋 Step 6: Deploying frontend to backend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd khair/charity-app && cp -r frontend/build backend/public"
Write-Host "✅ Frontend deployed!" -ForegroundColor Green

# Step 7: Create .env file for backend
Write-Host ""
Write-Host "🔐 Step 7: Configuring environment variables..." -ForegroundColor Yellow

$ENV_CONTENT = @'
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=*
'@

Invoke-SSHCommand "cat > khair/charity-app/backend/.env << 'EOFENV'`n$ENV_CONTENT`nEOFENV"
Write-Host "✅ Environment configured!" -ForegroundColor Green

# Step 8: Start application with PM2
Write-Host ""
Write-Host "🚀 Step 8: Starting application with PM2..." -ForegroundColor Yellow
Invoke-SSHCommand "cd khair/charity-app/backend && pm2 delete charity-app 2>/dev/null || true"
Invoke-SSHCommand "cd khair/charity-app/backend && pm2 start src/server.js --name charity-app"
Invoke-SSHCommand "pm2 save"
Invoke-SSHCommand "pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep 'sudo' | bash || true"
Write-Host "✅ Application started with PM2!" -ForegroundColor Green

# Step 9: Configure Nginx
Write-Host ""
Write-Host "🌐 Step 9: Configuring Nginx reverse proxy..." -ForegroundColor Yellow

$NGINX_CONFIG = @'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
'@

Invoke-SSHCommand "sudo bash -c `"cat > /etc/nginx/sites-available/default << 'EOFNGINX'`n$NGINX_CONFIG`nEOFNGINX`""
Invoke-SSHCommand "sudo nginx -t"
Invoke-SSHCommand "sudo systemctl restart nginx"
Invoke-SSHCommand "sudo systemctl enable nginx"
Write-Host "✅ Nginx configured!" -ForegroundColor Green

# Step 10: Verify deployment
Write-Host ""
Write-Host "🔍 Step 10: Verifying deployment..." -ForegroundColor Yellow

Write-Host "Checking PM2 status..." -ForegroundColor Cyan
Invoke-SSHCommand "pm2 status"

Write-Host "`nChecking Nginx status..." -ForegroundColor Cyan
Invoke-SSHCommand "sudo systemctl status nginx --no-pager | head -10"

Write-Host "`nTesting API endpoint..." -ForegroundColor Cyan
try {
    Invoke-SSHCommand "curl -s http://localhost:5000/api/health || echo 'API check completed'"
} catch {
    Write-Host "Note: API health endpoint may not exist yet" -ForegroundColor Yellow
}

Write-Host "`nTesting web server..." -ForegroundColor Cyan
Invoke-SSHCommand "curl -I http://localhost:5000 2>/dev/null | head -5 || echo 'Server check completed'"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your application is now live at:" -ForegroundColor Yellow
Write-Host "   http://$EC2_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Useful commands:" -ForegroundColor Yellow
Write-Host "   ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP" -ForegroundColor Gray
Write-Host "   pm2 logs charity-app" -ForegroundColor Gray
Write-Host "   pm2 restart charity-app" -ForegroundColor Gray
Write-Host "   pm2 status" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Green


