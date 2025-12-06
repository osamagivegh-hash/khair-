#!/bin/bash
# EC2 Deployment Script for Charity App
set -e

echo "🚀 Starting Deployment"
echo "======================"
echo ""

echo "1️⃣ Updating system..."
sudo apt-get update -y

echo "2️⃣ Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "   Node version: $(node --version)"

echo "3️⃣ Installing git, nginx..."
sudo apt-get install -y git nginx

echo "4️⃣ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "   PM2 version: $(pm2 --version)"

echo "5️⃣ Cloning repository..."
cd ~
rm -rf khair
git clone https://github.com/osamagivegh-hash/khair.git khair
echo "   ✅ Repository cloned"

echo "6️⃣ Installing backend dependencies..."
cd khair/charity-app/backend
npm install
echo "   ✅ Backend dependencies installed"

echo "7️⃣ Building frontend..."
cd ../frontend
npm install
npm run build
echo "   ✅ Frontend built"

echo "8️⃣ Deploying frontend to backend..."
cd ..
mkdir -p backend/public
cp -r frontend/dist/* backend/public/
echo "   ✅ Frontend deployed"

echo "9️⃣ Creating .env file..."
cat > backend/.env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
ENVEOF
echo "   ✅ Environment configured"

echo "🔟 Starting application with PM2..."
cd backend
pm2 delete charity-app 2>/dev/null || true
pm2 start src/server.js --name charity-app
pm2 save
pm2 startup | grep 'sudo' | bash || true
echo "   ✅ Application started"

echo "1️⃣1️⃣ Configuring Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/default << '\''NGINXEOF'\''
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '\''upgrade'\'';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF'

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
echo "   ✅ Nginx configured"

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your app is live at: http://157.175.168.29"
echo ""

