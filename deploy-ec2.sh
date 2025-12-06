#!/bin/bash
# AWS EC2 Automated Deployment Script (Bash)
# Deploy charity-app (React + Node.js) to EC2

set -e

# Configuration
EC2_IP="157.175.168.29"
SSH_USER="ubuntu"
SSH_KEY="C:/Users/TestUser/Desktop/aws/charity-key.pem"
REPO_URL="https://github.com/osamagivegh-hash/khair.git"
APP_PORT=5000

echo "🚀 Starting AWS EC2 Deployment"
echo "================================"
echo "EC2 IP: $EC2_IP"
echo "Project: charity-app (React + Node.js)"
echo ""

# Function to run SSH command
run_ssh() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP "$@"
}

# Step 1: Test SSH Connection
echo "📡 Step 1: Testing SSH connection..."
if run_ssh "echo 'SSH connection successful' && uname -a"; then
    echo "✅ SSH connection successful!"
else
    echo "❌ SSH connection failed"
    exit 1
fi

# Step 2: Update system and install dependencies
echo ""
echo "📦 Step 2: Preparing server (Node.js, nginx, pm2, git)..."

run_ssh 'bash -s' << 'ENDSSH'
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
ENDSSH

echo "✅ Server prepared successfully!"

# Step 3: Clone project
echo ""
echo "📥 Step 3: Cloning project from GitHub..."
run_ssh "rm -rf khair && git clone $REPO_URL khair"
echo "✅ Project cloned successfully!"

# Step 4: Install backend dependencies
echo ""
echo "📦 Step 4: Installing backend dependencies..."
run_ssh "cd khair/charity-app/backend && npm install"
echo "✅ Backend dependencies installed!"

# Step 5: Install frontend dependencies and build
echo ""
echo "🏗️  Step 5: Building React frontend..."
run_ssh "cd khair/charity-app/frontend && npm install && npm run build"
echo "✅ Frontend built successfully!"

# Step 6: Copy frontend build to backend
echo ""
echo "📋 Step 6: Deploying frontend to backend..."
run_ssh "cd khair/charity-app && mkdir -p backend/public && cp -r frontend/build/* backend/public/"
echo "✅ Frontend deployed!"

# Step 7: Create .env file for backend
echo ""
echo "🔐 Step 7: Configuring environment variables..."
run_ssh 'cat > khair/charity-app/backend/.env << "EOF"
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=*
EOF'
echo "✅ Environment configured!"

# Step 8: Start application with PM2
echo ""
echo "🚀 Step 8: Starting application with PM2..."
run_ssh "cd khair/charity-app/backend && pm2 delete charity-app 2>/dev/null || true"
run_ssh "cd khair/charity-app/backend && pm2 start src/server.js --name charity-app"
run_ssh "pm2 save"
run_ssh "pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep 'sudo' || true" | bash || true
echo "✅ Application started with PM2!"

# Step 9: Configure Nginx
echo ""
echo "🌐 Step 9: Configuring Nginx reverse proxy..."
run_ssh 'sudo bash -c "cat > /etc/nginx/sites-available/default << \"EOFNGINX\"
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOFNGINX"'

run_ssh "sudo nginx -t"
run_ssh "sudo systemctl restart nginx"
run_ssh "sudo systemctl enable nginx"
echo "✅ Nginx configured!"

# Step 10: Verify deployment
echo ""
echo "🔍 Step 10: Verifying deployment..."
echo "Checking PM2 status..."
run_ssh "pm2 status"

echo ""
echo "Checking Nginx status..."
run_ssh "sudo systemctl status nginx --no-pager | head -10"

echo ""
echo "Testing web server..."
run_ssh "curl -I http://localhost:5000 2>/dev/null | head -5 || echo 'Server check completed'"

echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "🌐 Your application is now live at:"
echo "   http://$EC2_IP"
echo ""
echo "📊 Useful commands:"
echo "   ssh -i \"$SSH_KEY\" $SSH_USER@$EC2_IP"
echo "   pm2 logs charity-app"
echo "   pm2 restart charity-app"
echo "   pm2 status"
echo ""
echo "🎉 Happy deploying!"


