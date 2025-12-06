# Quick EC2 Deployment Script - Step by Step
# Run this script to deploy charity-app to EC2

$EC2_IP = "157.175.168.29"
$SSH_KEY = "C:\Users\TestUser\Desktop\aws\charity-key.pem"
$SSH_USER = "ubuntu"

Write-Host "🚀 EC2 Deployment - Charity App" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Test connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSH_USER@$EC2_IP "echo '✅ Connected successfully!'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SSH connection failed. Trying to fix permissions..." -ForegroundColor Red
    icacls $SSH_KEY /reset
    icacls $SSH_KEY /inheritance:r /grant:r "${env:USERNAME}:(R)"
    Write-Host "Please run the script again." -ForegroundColor Yellow
    exit
}

Write-Host "`n📦 Installing dependencies on EC2...`n" -ForegroundColor Yellow

# Create a temporary bash script file
$deployScript = @'
#!/bin/bash
set -e

echo "1️⃣ Updating system..."
sudo apt-get update -y > /dev/null 2>&1

echo "2️⃣ Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
fi
node --version

echo "3️⃣ Installing git, nginx..."
sudo apt-get install -y git nginx > /dev/null 2>&1

echo "4️⃣ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi
pm2 --version

echo "5️⃣ Cloning repository..."
rm -rf khair
git clone https://github.com/osamagivegh-hash/khair.git khair

echo "6️⃣ Installing backend dependencies..."
cd khair/charity-app/backend
npm install > /dev/null 2>&1

echo "7️⃣ Building frontend..."
cd ../frontend
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

echo "8️⃣ Deploying frontend..."
cd ..
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "9️⃣ Creating .env file..."
cat > backend/.env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
ENVEOF

echo "🔟 Starting with PM2..."
cd backend
pm2 delete charity-app 2>/dev/null || true
pm2 start src/server.js --name charity-app
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep 'sudo' | bash || true

echo "1️⃣1️⃣ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ''
echo '✅ Deployment Complete!'
echo '========================'
echo ''
echo 'Application Status:'
pm2 status

echo ''
echo 'Testing application...'
curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost:5000 || echo 'Server starting...'

echo ''
echo "🌐 Access your app at: http://$EC2_IP"
'@

# Upload and execute the script
Write-Host "Uploading deployment script to EC2..." -ForegroundColor Cyan
$deployScript | ssh -i $SSH_KEY $SSH_USER@$EC2_IP "cat > deploy.sh && chmod +x deploy.sh && ./deploy.sh"

Write-Host "`n================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "🌐 Your application is live at:" -ForegroundColor Yellow
Write-Host "   http://$EC2_IP`n" -ForegroundColor Cyan

Write-Host "📊 Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs:    ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP 'pm2 logs charity-app'" -ForegroundColor Gray
Write-Host "   Check status: ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP 'pm2 status'" -ForegroundColor Gray
Write-Host "   Restart app:  ssh -i `"$SSH_KEY`" $SSH_USER@$EC2_IP 'pm2 restart charity-app'`n" -ForegroundColor Gray

