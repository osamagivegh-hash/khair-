# 🚀 Deploy to EC2 Now - Quick Guide

## One-Command Deployment

Run this in PowerShell:

```powershell
.\quick-deploy-ec2.ps1
```

That's it! The script will:
1. ✅ Test SSH connection
2. ✅ Install all dependencies (Node.js, nginx, pm2, git)
3. ✅ Clone your repository
4. ✅ Build frontend
5. ✅ Deploy backend
6. ✅ Configure PM2
7. ✅ Setup Nginx
8. ✅ Start your application

---

## If Script Fails

### SSH Permission Issues

If you get a permission error, run this first:

```powershell
icacls "C:\Users\TestUser\Desktop\aws\charity-key.pem" /reset
icacls "C:\Users\TestUser\Desktop\aws\charity-key.pem" /inheritance:r /grant:r "${env:USERNAME}:(R)"
```

Then run the deployment script again.

### Manual Deployment

If the automated script doesn't work, deploy manually:

#### 1. Connect to EC2
```powershell
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29
```

#### 2. Run the deployment commands
```bash
# Update and install Node.js
sudo apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2

# Clone project
git clone https://github.com/osamagivegh-hash/khair.git
cd khair/charity-app

# Setup backend
cd backend
npm install
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/charity-app
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
EOF

# Build frontend
cd ../frontend
npm install
npm run build

# Deploy frontend
mkdir -p ../backend/public
cp -r build/* ../backend/public/

# Start with PM2
cd ../backend
pm2 start src/server.js --name charity-app
pm2 save
pm2 startup

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

Paste this Nginx config:
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## After Deployment

### ✅ Your app is live at:
```
http://157.175.168.29
```

### Check Status
```powershell
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "pm2 status"
```

### View Logs
```powershell
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "pm2 logs charity-app"
```

### Restart App
```powershell
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "pm2 restart charity-app"
```

---

## Troubleshooting

### Can't connect to EC2?
- Check EC2 security group allows port 22 (SSH) and port 80 (HTTP)
- Verify EC2 instance is running
- Check SSH key path is correct

### App not starting?
```bash
# SSH to server and check logs
pm2 logs charity-app
```

### 502 Bad Gateway?
```bash
# SSH to server and restart app
pm2 restart charity-app
```

---

## Need Help?

Check the detailed guide: `EC2_DEPLOYMENT_GUIDE.md`

🎉 Happy deploying!

