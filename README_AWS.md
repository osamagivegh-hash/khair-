# Al-Khair Charity Application - AWS Deployment

Complete AWS deployment configuration for the Al-Khair charity platform.

## 📁 AWS Deployment Files

| File | Purpose |
|------|---------|
| `amplify.yml` | AWS Amplify build configuration |
| `Dockerfile.aws` | Optimized Docker configuration for AWS |
| `.dockerignore` | Docker build exclusions |
| `aws-cloudformation-template.yaml` | Complete infrastructure as code (VPC, ECS, ALB) |
| `aws-ecs-task-definition.json` | ECS Fargate task configuration |
| `buildspec.yml` | AWS CodeBuild configuration for CI/CD |
| `next.config.aws.js` | Next.js config optimized for AWS |
| `deploy-to-aws.sh` | Automated deployment script (Bash) |
| `deploy-to-aws.ps1` | Automated deployment script (PowerShell) |

## 📚 Documentation Files

| File | Contents |
|------|----------|
| `AWS_QUICK_START.md` | **START HERE** - Quick deployment guide |
| `AWS_DEPLOYMENT_GUIDE.md` | Complete step-by-step deployment instructions |
| `AWS_ENVIRONMENT_VARIABLES.md` | Environment variables configuration guide |
| `README_AWS.md` | This file - overview of AWS deployment |

## 🚀 Quick Start

### Option 1: AWS Amplify (Recommended)

1. Push code to GitHub
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Connect repository and add environment variables
4. Deploy

**Time:** 10 minutes  
**Cost:** ~$15-50/month

### Option 2: ECS Fargate (Production)

```bash
# Windows
.\deploy-to-aws.ps1

# Mac/Linux
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

**Time:** 30-45 minutes  
**Cost:** ~$30-100/month

### Option 3: Elastic Beanstalk

```bash
pip install awsebcli
eb init -p docker al-khair-app
eb create al-khair-prod
```

**Time:** 20 minutes  
**Cost:** ~$20-60/month

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **MongoDB Atlas** account and connection string
3. **Cloudinary** account and API credentials
4. **Git repository** (for Amplify)
5. **AWS CLI** installed (for ECS/EB)
6. **Docker** installed (for ECS)

## 🔑 Required Environment Variables

```bash
DATABASE_URL="mongodb+srv://..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

See `AWS_ENVIRONMENT_VARIABLES.md` for detailed instructions.

## 🏗️ Infrastructure Overview

### AWS Amplify
- Automatic CI/CD from Git
- Global CDN (CloudFront)
- SSL certificates
- Custom domains
- Environment variables

### ECS Fargate (CloudFormation)
- VPC with public subnets
- Application Load Balancer (ALB)
- ECS Cluster with Fargate tasks
- Auto-scaling (2-4 tasks)
- CloudWatch logging
- Secrets Manager integration
- Health checks

### Architecture Diagram

```
Internet
   ↓
Route 53 (DNS)
   ↓
CloudFront (CDN) / ALB
   ↓
ECS Fargate Tasks (2-4 instances)
   ↓
MongoDB Atlas (External)
   ↓
Cloudinary (External)
```

## 🔒 Security Features

- ✅ HTTPS/SSL encryption
- ✅ Security headers configured
- ✅ Secrets stored in AWS Secrets Manager
- ✅ IAM roles with least privilege
- ✅ VPC security groups
- ✅ CORS configured properly
- ✅ No secrets in code or Git

## 📊 Monitoring & Logging

### CloudWatch Logs
- Application logs
- Container logs
- ALB access logs

### CloudWatch Alarms
- CPU utilization
- Memory utilization
- HTTP errors (4xx/5xx)
- Response times

### Health Checks
- Endpoint: `/api/health`
- Interval: 30 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

## 🔄 CI/CD Pipeline

### With AWS Amplify
- Automatic builds on Git push
- Preview environments for branches
- Instant rollbacks

### With CodePipeline
1. Source: GitHub/CodeCommit
2. Build: CodeBuild (buildspec.yml)
3. Deploy: ECS Fargate
4. Notifications: SNS/Email

## 💰 Cost Optimization

### Tips to Reduce Costs:
1. Use AWS Free Tier when possible
2. Enable auto-scaling to scale down during low traffic
3. Use MongoDB Atlas free tier (M0)
4. Use Cloudinary free tier
5. Consider Spot instances for non-critical workloads
6. Set up billing alerts

### Cost Breakdown (Production):

**Amplify (~$35/month):**
- Build minutes: $10
- Hosting: $15
- Data transfer: $10

**ECS Fargate (~$60/month):**
- 2x Tasks (0.5 vCPU, 1GB): $30
- ALB: $20
- Data transfer: $10

**Elastic Beanstalk (~$40/month):**
- t3.small instance: $15
- Load balancer: $20
- Data transfer: $5

## 🛠️ Deployment Commands

### Amplify
```bash
# Deploy via Git
git push origin main
```

### ECS
```bash
# Automated
./deploy-to-aws.sh

# Manual update
aws ecs update-service \
  --cluster al-khair-prod-cluster \
  --service al-khair-prod-service \
  --force-new-deployment
```

### Elastic Beanstalk
```bash
eb deploy
eb open
```

## 🧪 Testing Deployment

After deployment:

```bash
# Check health endpoint
curl https://your-app-url/api/health

# Check main page
curl https://your-app-url/

# View logs (ECS)
aws logs tail /ecs/al-khair-prod-app --follow

# Check service status (ECS)
aws ecs describe-services \
  --cluster al-khair-prod-cluster \
  --services al-khair-prod-service
```

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify MongoDB connection string
- Check Node.js version compatibility

### Container Won't Start
- Check CloudWatch logs
- Verify Prisma can connect to MongoDB
- Ensure all secrets are accessible

### Image Upload Fails
- Verify Cloudinary credentials
- Check CORS settings
- Review application logs

See `AWS_DEPLOYMENT_GUIDE.md` section "Troubleshooting" for detailed solutions.

## 📚 Additional Documentation

- **Quick Start:** `AWS_QUICK_START.md`
- **Full Guide:** `AWS_DEPLOYMENT_GUIDE.md`
- **Environment Variables:** `AWS_ENVIRONMENT_VARIABLES.md`
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **AWS Amplify Docs:** https://docs.amplify.aws/
- **AWS ECS Docs:** https://docs.aws.amazon.com/ecs/

## 🔗 Useful Links

- [AWS Console](https://console.aws.amazon.com/)
- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [ECS Console](https://console.aws.amazon.com/ecs/)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups)
- [Secrets Manager](https://console.aws.amazon.com/secretsmanager/)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Cloudinary Dashboard](https://cloudinary.com/console)

## 🎯 Recommended Approach

1. **Development:** Local development with `npm run dev`
2. **Staging:** Deploy to AWS Amplify (quick, easy)
3. **Production:** Deploy to ECS Fargate (scalable, production-grade)

or

1. **All Environments:** Use AWS Amplify with branch-based deployments
   - `main` branch → Production
   - `develop` branch → Staging
   - Feature branches → Preview environments

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Application is accessible via URL
- [ ] Admin dashboard works (`/admin`)
- [ ] Image uploads working
- [ ] Database connectivity verified
- [ ] All pages render correctly
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] Team notified of deployment
- [ ] Documentation updated

## 🎉 Success!

Once deployed, your application will be:
- ✅ Highly available
- ✅ Auto-scaling
- ✅ Secure with HTTPS
- ✅ Globally distributed (with CloudFront)
- ✅ Monitored and logged
- ✅ Easy to update and maintain

---

**Need Help?**
- Check `AWS_QUICK_START.md` for quick instructions
- Read `AWS_DEPLOYMENT_GUIDE.md` for detailed steps
- Review `AWS_ENVIRONMENT_VARIABLES.md` for configuration help

**Questions?**
Open an issue or check AWS documentation.

Good luck with your deployment! 🚀


