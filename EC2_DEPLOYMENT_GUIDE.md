# AWS EC2 Deployment Guide - Charity App

Complete automated deployment guide for deploying the charity-app (React + Node.js) to AWS EC2.

## 🚀 Quick Deploy

### Windows (PowerShell)
```powershell
.\deploy-ec2.ps1
```

### Mac/Linux (Bash)
```bash
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

---

## 📋 Deployment Configuration

| Setting | Value |
|---------|-------|
| **EC2 IP** | 157.175.168.29 |
| **SSH User** | ubuntu |
| **SSH Key** | C:\Users\TestUser\Desktop\aws\charity-key.pem |
| **Repository** | https://github.com/osamagivegh-hash/khair.git |
| **App Port** | 5000 |
| **Web URL** | http://157.175.168.29 |

---

## 🎯 What Gets Deployed

The automated script performs the following steps:

### 1. ✅ SSH Connection Test
- Verifies connectivity to EC2
- Checks SSH key permissions

### 2. ✅ Server Preparation
Installs:
- Node.js 20.x
- npm
- git
- nginx
- pm2 (process manager)

### 3. ✅ Project Deployment
- Clones repository from GitHub
- Installs backend dependencies
- Installs frontend dependencies
- Builds React frontend
- Deploys frontend to backend/public

### 4. ✅ Application Configuration
- Creates production .env file
- Starts Node.js server with PM2
- Configures PM2 auto-startup

### 5. ✅ Nginx Configuration
- Sets up reverse proxy
- Configures port 80 → 5000
- Enables and starts nginx

### 6. ✅ Verification
- Tests PM2 status
- Tests nginx status
- Tests application endpoints

---

## 📁 Project Structure on EC2

```
/home/ubuntu/
└── khair/
    └── charity-app/
        ├── backend/
        │   ├── src/
        │   │   └── server.js
        │   ├── public/          # Frontend build files
        │   ├── package.json
        │   └── .env
        └── frontend/
            ├── src/
            ├── build/           # React build output
            └── package.json
```

---

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

### 1. Connect to EC2
```bash
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29
```

### 2. Update System
```bash
sudo apt-get update -y
sudo apt-get upgrade -y
```

### 3. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Install Dependencies
```bash
sudo apt-get install -y git nginx
sudo npm install -g pm2
```

### 5. Clone Project
```bash
git clone https://github.com/osamagivegh-hash/khair.git khair
cd khair/charity-app
```

### 6. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
EOF
```

### 7. Setup Frontend
```bash
cd ../frontend
npm install
npm run build
```

### 8. Deploy Frontend to Backend
```bash
cd ..
mkdir -p backend/public
cp -r frontend/build/* backend/public/
```

### 9. Start with PM2
```bash
cd backend
pm2 start src/server.js --name charity-app
pm2 save
pm2 startup
```

### 10. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/default
```

Add this configuration:
```nginx
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
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

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
```

Test and restart nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔍 Verification

### Check PM2 Status
```bash
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "pm2 status"
```

### Check Application Logs
```bash
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "pm2 logs charity-app"
```

### Test from Your Computer
```bash
# Test web app
curl http://157.175.168.29

# Test API (if health endpoint exists)
curl http://157.175.168.29/api/health
```

### Open in Browser
Visit: http://157.175.168.29

---

## 🛠️ Management Commands

### SSH to Server
```bash
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29
```

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs charity-app

# Restart app
pm2 restart charity-app

# Stop app
pm2 stop charity-app

# Start app
pm2 start charity-app

# Delete app from PM2
pm2 delete charity-app
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Update Application
```bash
# SSH to server
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29

# Pull latest code
cd ~/khair
git pull

# Update backend
cd charity-app/backend
npm install
pm2 restart charity-app

# Update frontend
cd ../frontend
npm install
npm run build
cp -r build/* ../backend/public/
```

---

## 🐛 Troubleshooting

### SSH Connection Issues

**Problem:** Permission denied
```bash
# Windows: Fix key permissions
icacls "C:\Users\TestUser\Desktop\aws\charity-key.pem" /inheritance:r /grant:r "%USERNAME%:R"

# Linux/Mac: Fix key permissions
chmod 400 C:/Users/TestUser/Desktop/aws/charity-key.pem
```

**Problem:** Connection timeout
- Check EC2 security group allows SSH (port 22)
- Check EC2 is running
- Verify IP address is correct

### Application Not Starting

**Check PM2 logs:**
```bash
pm2 logs charity-app --lines 50
```

**Common issues:**
- Missing dependencies: `cd ~/khair/charity-app/backend && npm install`
- Wrong Node version: `node --version` (should be 20.x)
- Port already in use: `sudo lsof -i :5000`

### Nginx Not Working

**Check nginx status:**
```bash
sudo systemctl status nginx
```

**Check nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Test configuration:**
```bash
sudo nginx -t
```

### Website Shows 502 Bad Gateway

This means nginx is running but can't connect to your app.

**Check if app is running:**
```bash
pm2 status
curl http://localhost:5000
```

**Restart app:**
```bash
pm2 restart charity-app
```

### Port 80 Not Accessible

**Check EC2 Security Group:**
- Ensure inbound rule allows HTTP (port 80) from 0.0.0.0/0

**Check nginx:**
```bash
sudo systemctl status nginx
sudo netstat -tulpn | grep :80
```

---

## 🔐 Security Considerations

### Current Setup
- ✅ SSH key authentication
- ✅ Nginx reverse proxy
- ⚠️ HTTP only (no HTTPS)
- ⚠️ No firewall configured
- ⚠️ CORS set to allow all origins

### Recommended Improvements

1. **Enable HTTPS with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. **Configure UFW Firewall:**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. **Update CORS in backend .env:**
```bash
CORS_ORIGIN=http://yourdomain.com
```

4. **Set up MongoDB authentication**
5. **Configure environment-specific secrets**
6. **Enable PM2 monitoring**

---

## 📊 Monitoring

### PM2 Monitoring
```bash
# View real-time logs
pm2 logs charity-app

# Monitor CPU/Memory
pm2 monit

# Web dashboard
pm2 web
```

### Nginx Monitoring
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network connections
netstat -tulpn
```

---

## 🔄 CI/CD Integration

For automatic deployments on git push, set up GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to EC2

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: 157.175.168.29
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/khair
            git pull
            cd charity-app/backend
            npm install
            pm2 restart charity-app
            cd ../frontend
            npm install
            npm run build
            cp -r build/* ../backend/public/
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at http://157.175.168.29
- [ ] PM2 running and auto-starts on reboot
- [ ] Nginx configured and running
- [ ] Frontend loads correctly
- [ ] API endpoints working
- [ ] Logs accessible via `pm2 logs`
- [ ] Security group allows ports 22, 80
- [ ] Consider adding HTTPS
- [ ] Consider adding domain name
- [ ] Set up monitoring/alerts

---

## 🎉 Success!

Your charity application is now deployed and running on AWS EC2!

**URL:** http://157.175.168.29

For any issues, check the troubleshooting section or logs on the server.

Happy deploying! 🚀


