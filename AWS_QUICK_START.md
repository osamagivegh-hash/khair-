# 🚀 AWS Quick Start Guide

## Choose Your Deployment Method

### 🌟 Method 1: AWS Amplify (RECOMMENDED - Easiest)

**Best for:** Quick deployment, automatic CI/CD, small to medium traffic

**Time:** 10 minutes

```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for AWS deployment"
git push

# 2. Go to AWS Amplify Console
# https://console.aws.amazon.com/amplify/

# 3. Connect your repository and deploy
# Add these environment variables in Amplify Console:
DATABASE_URL=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

✅ **Done!** Your app will be live at: `https://xxxxx.amplifyapp.com`

---

### 🐳 Method 2: ECS Fargate (Production-Grade)

**Best for:** Full control, high traffic, enterprise applications

**Time:** 30-45 minutes

#### Prerequisites:
```bash
# Install AWS CLI
# Windows: https://awscli.amazonaws.com/AWSCLIV2.msi
# Mac: brew install awscli
# Linux: See AWS documentation

# Configure AWS CLI
aws configure
```

#### Quick Deploy (Automated Script):

**Windows (PowerShell):**
```powershell
.\deploy-to-aws.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

The script will:
1. ✅ Create ECR repository
2. ✅ Store secrets in AWS Secrets Manager
3. ✅ Deploy infrastructure (VPC, ALB, ECS)
4. ✅ Build and push Docker image
5. ✅ Deploy your application

#### Manual Deploy:

See `AWS_DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.

---

### ⚡ Method 3: Elastic Beanstalk

**Best for:** Balance between ease and control

**Time:** 20 minutes

```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init -p docker al-khair-app --region us-east-1
eb create al-khair-prod

# Set environment variables
eb setenv \
  DATABASE_URL="your_mongodb_connection_string" \
  CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name" \
  CLOUDINARY_API_KEY="your_cloudinary_api_key" \
  CLOUDINARY_API_SECRET="your_cloudinary_api_secret" \
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"

# Open your app
eb open
```

---

## 📋 Required Information

Before deployment, have these ready:

### 1. MongoDB Connection String
Get from [MongoDB Atlas](https://cloud.mongodb.com/):
- Create cluster (free tier available)
- Get connection string
- **Important:** Whitelist IP `0.0.0.0/0` in Network Access

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/al-khair?retryWrites=true&w=majority
```

### 2. Cloudinary Credentials
Get from [Cloudinary Dashboard](https://cloudinary.com/console):
- Cloud Name
- API Key
- API Secret

---

## 🎯 Recommended Path

**For Most Users:**
1. Start with **AWS Amplify** (easiest)
2. If you need more control later, migrate to **ECS Fargate**

**For Enterprise/High Traffic:**
- Go directly to **ECS Fargate** with the automated script

---

## 💰 Estimated Costs

| Method | Monthly Cost | Best For |
|--------|--------------|----------|
| **Amplify** | $15-50 | Small-medium traffic |
| **ECS Fargate** | $30-100 | Production, high traffic |
| **Elastic Beanstalk** | $20-60 | Balanced approach |

*Costs vary based on traffic and usage*

---

## 🆘 Common Issues

### Build Fails
```bash
# Check environment variables are set correctly
# Verify MongoDB connection string is accessible
# Ensure MongoDB Atlas allows connections from 0.0.0.0/0
```

### Container Won't Start
```bash
# Check logs:
# Amplify: Check in Amplify Console → Logs
# ECS: aws logs tail /ecs/al-khair-prod-app --follow
```

### Image Upload Not Working
```bash
# Verify all Cloudinary environment variables are set
# Check Cloudinary CORS settings
# Review application logs for errors
```

---

## 📚 Additional Resources

- **Full Documentation:** See `AWS_DEPLOYMENT_GUIDE.md`
- **Docker Configuration:** `Dockerfile.aws`
- **CloudFormation Template:** `aws-cloudformation-template.yaml`
- **Task Definition:** `aws-ecs-task-definition.json`

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Application is accessible
- [ ] Test admin login at `/admin`
- [ ] Test image upload functionality
- [ ] Verify database connectivity
- [ ] Check all pages load correctly
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (automatic with Amplify)
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy

---

## 🎉 Next Steps

1. **Deploy using your chosen method**
2. **Test the application thoroughly**
3. **Set up custom domain** (if needed)
4. **Configure monitoring**
5. **Share with your team!**

---

Need help? Check the detailed guide: `AWS_DEPLOYMENT_GUIDE.md`

Good luck! 🚀


