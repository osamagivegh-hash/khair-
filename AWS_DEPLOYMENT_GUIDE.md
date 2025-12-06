# AWS Deployment Guide for Al-Khair Charity Application

This guide covers three deployment methods for AWS. Choose the one that best fits your needs.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- MongoDB database URL (MongoDB Atlas recommended)
- Cloudinary account credentials

---

## Option 1: AWS Amplify (Easiest - Recommended for Quick Setup)

AWS Amplify is the simplest way to deploy Next.js applications.

### Steps:

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to AWS Amplify Console**
   - Navigate to: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

3. **Connect your repository**
   - Select your Git provider
   - Authorize and select the `al-khair` repository
   - Select the main branch

4. **Configure build settings**
   - Amplify will auto-detect `amplify.yml` in your repo
   - Review the build settings

5. **Add environment variables**
   - Click "Environment variables" in the left menu
   - Add the following variables:
     ```
     DATABASE_URL=your_mongodb_connection_string
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     ```

6. **Deploy**
   - Click "Save and deploy"
   - Wait for deployment to complete (usually 5-10 minutes)

7. **Access your application**
   - You'll get a URL like: `https://main.xxxxx.amplifyapp.com`
   - You can add a custom domain in the Amplify console

### Amplify Benefits:
- ✅ Automatic CI/CD
- ✅ Auto SSL certificates
- ✅ Global CDN
- ✅ Easy rollbacks
- ✅ Preview environments for branches

---

## Option 2: AWS ECS Fargate (Production-Grade)

This option provides more control and is suitable for production workloads.

### Part A: Initial Setup

1. **Install AWS CLI and configure it**
   ```bash
   aws configure
   ```

2. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name al-khair --region us-east-1
   ```

3. **Store secrets in AWS Secrets Manager**
   ```bash
   # Create secrets
   aws secretsmanager create-secret \
     --name al-khair/DATABASE_URL \
     --secret-string "your_mongodb_connection_string" \
     --region us-east-1

   aws secretsmanager create-secret \
     --name al-khair/CLOUDINARY_CLOUD_NAME \
     --secret-string "your_cloudinary_cloud_name" \
     --region us-east-1

   aws secretsmanager create-secret \
     --name al-khair/CLOUDINARY_API_KEY \
     --secret-string "your_cloudinary_api_key" \
     --region us-east-1

   aws secretsmanager create-secret \
     --name al-khair/CLOUDINARY_API_SECRET \
     --secret-string "your_cloudinary_api_secret" \
     --region us-east-1

   aws secretsmanager create-secret \
     --name al-khair/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
     --secret-string "your_cloudinary_cloud_name" \
     --region us-east-1
   ```

### Part B: Deploy Infrastructure

4. **Deploy CloudFormation Stack**
   ```bash
   # First, get your AWS account ID
   AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   
   # Deploy the stack
   aws cloudformation create-stack \
     --stack-name al-khair-infrastructure \
     --template-body file://aws-cloudformation-template.yaml \
     --parameters ParameterKey=ContainerImage,ParameterValue=$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/al-khair:latest \
     --capabilities CAPABILITY_NAMED_IAM \
     --region us-east-1

   # Wait for stack creation (takes ~10 minutes)
   aws cloudformation wait stack-create-complete \
     --stack-name al-khair-infrastructure \
     --region us-east-1
   ```

### Part C: Build and Push Docker Image

5. **Build and push Docker image**
   ```bash
   # Get AWS account ID
   AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   AWS_REGION=us-east-1

   # Login to ECR
   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

   # Build the image
   docker build -f Dockerfile.aws -t al-khair:latest .

   # Tag the image
   docker tag al-khair:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest

   # Push to ECR
   docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest
   ```

### Part D: Update ECS Service

6. **Update the task definition with secrets**
   ```bash
   # Get your account ID and region
   AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   AWS_REGION=us-east-1

   # Update the task definition JSON file with your values
   sed -i "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" aws-ecs-task-definition.json
   sed -i "s/YOUR_REGION/$AWS_REGION/g" aws-ecs-task-definition.json

   # Register the task definition
   aws ecs register-task-definition \
     --cli-input-json file://aws-ecs-task-definition.json \
     --region $AWS_REGION
   ```

7. **Force new deployment**
   ```bash
   aws ecs update-service \
     --cluster al-khair-prod-cluster \
     --service al-khair-prod-service \
     --force-new-deployment \
     --region us-east-1
   ```

8. **Get your Load Balancer URL**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name al-khair-infrastructure \
     --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
     --output text \
     --region us-east-1
   ```

### ECS Benefits:
- ✅ Full control over infrastructure
- ✅ Auto-scaling
- ✅ Load balancing
- ✅ Zero-downtime deployments
- ✅ Container insights

---

## Option 3: AWS Elastic Beanstalk (Balanced Approach)

Elastic Beanstalk provides a balance between ease of use and control.

### Steps:

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   eb init -p docker al-khair-app --region us-east-1
   ```

3. **Create environment**
   ```bash
   eb create al-khair-prod --single --instance-type t3.small
   ```

4. **Set environment variables**
   ```bash
   eb setenv \
     DATABASE_URL="your_mongodb_connection_string" \
     CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name" \
     CLOUDINARY_API_KEY="your_cloudinary_api_key" \
     CLOUDINARY_API_SECRET="your_cloudinary_api_secret" \
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

6. **Open your application**
   ```bash
   eb open
   ```

### Elastic Beanstalk Benefits:
- ✅ Managed platform
- ✅ Easy updates
- ✅ Built-in monitoring
- ✅ Auto-scaling capabilities

---

## Option 4: AWS CodePipeline (CI/CD Automation)

For continuous deployment, set up CodePipeline with CodeBuild.

### Steps:

1. **Create CodeBuild Project**
   - Go to AWS CodeBuild Console
   - Create new project: `al-khair-build`
   - Source: Connect to your GitHub repository
   - Environment: 
     - Managed image
     - Ubuntu
     - Standard runtime
     - Image: aws/codebuild/standard:7.0
   - Buildspec: Use `buildspec.yml` from repository

2. **Add environment variables to CodeBuild**
   ```
   AWS_ACCOUNT_ID
   AWS_DEFAULT_REGION
   IMAGE_REPO_NAME=al-khair
   ```

3. **Create CodePipeline**
   - Go to AWS CodePipeline Console
   - Create pipeline: `al-khair-pipeline`
   - Source stage: GitHub (connect repository)
   - Build stage: Use CodeBuild project created above
   - Deploy stage: Amazon ECS
     - Cluster: al-khair-prod-cluster
     - Service: al-khair-prod-service

---

## Post-Deployment Steps

### 1. Seed the Database
After deployment, seed your database:

```bash
# If using Amplify/EB, use SSH or backend console
# If using ECS, run a one-time task:

aws ecs run-task \
  --cluster al-khair-prod-cluster \
  --task-definition al-khair-prod-app \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"al-khair-container","command":["npm","run","seed"]}]}'
```

### 2. Set up Custom Domain (Optional)

#### For Amplify:
- Go to "Domain management" in Amplify Console
- Add your domain
- Follow DNS configuration instructions

#### For ECS/ALB:
- Go to Route 53
- Create a hosted zone for your domain
- Create an A record pointing to your ALB
- Optionally add ACM certificate for HTTPS

### 3. Enable HTTPS

#### For Amplify:
- Automatically provided

#### For ECS:
```bash
# Request certificate from ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Add HTTPS listener to ALB (update ALB manually or via CloudFormation)
```

### 4. Set up Monitoring

- Go to CloudWatch Console
- Create alarms for:
  - CPU utilization > 80%
  - Memory utilization > 80%
  - HTTP 5xx errors
  - Response time

### 5. Set up Backups

For MongoDB Atlas:
- Enable automatic backups in Atlas console
- Configure backup schedule

---

## Cost Estimation

### Amplify (~$15-50/month)
- Free tier: 1000 build minutes, 15 GB storage
- After: $0.01/build minute, $0.15/GB storage

### ECS Fargate (~$30-100/month)
- 2 tasks × 0.5 vCPU × 1GB = ~$30/month
- ALB: ~$20/month
- Data transfer: varies

### Elastic Beanstalk (~$20-60/month)
- t3.small instance: ~$15/month
- Load balancer (if enabled): ~$20/month

---

## Troubleshooting

### Common Issues:

1. **Build fails with Prisma error**
   - Ensure DATABASE_URL is set in environment variables
   - Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)

2. **Container fails health check**
   - Check CloudWatch logs
   - Verify `/api/health` endpoint is accessible
   - Ensure port 3000 is exposed

3. **Environment variables not working**
   - For Amplify: Check environment variables in console
   - For ECS: Verify Secrets Manager permissions
   - Restart service after updating variables

4. **Image upload fails**
   - Verify Cloudinary credentials
   - Check CloudWatch logs for error details
   - Ensure CORS settings in Cloudinary

### Viewing Logs:

```bash
# For ECS
aws logs tail /ecs/al-khair-prod-app --follow --region us-east-1

# For Amplify
# View in Amplify Console → App → Logs

# For Elastic Beanstalk
eb logs
```

---

## Recommended Setup

For this project, I recommend **AWS Amplify** for the following reasons:

1. ✅ Next.js is fully supported
2. ✅ Automatic deployments from Git
3. ✅ Free SSL certificates
4. ✅ Global CDN included
5. ✅ Easiest to set up and maintain
6. ✅ Great for small to medium traffic
7. ✅ Cost-effective

Start with Amplify and migrate to ECS Fargate if you need:
- More control over infrastructure
- Custom networking requirements
- Integration with other AWS services
- Higher traffic (10,000+ concurrent users)

---

## Next Steps

1. Choose your deployment method
2. Set up environment variables
3. Deploy the application
4. Set up custom domain (optional)
5. Configure monitoring and alerts
6. Set up automated backups

For additional help, refer to:
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

## Security Checklist

- [ ] All secrets stored in AWS Secrets Manager or environment variables
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured (see next.config.aws.js)
- [ ] IAM roles follow principle of least privilege
- [ ] CloudWatch alarms set up
- [ ] Backup strategy implemented
- [ ] WAF enabled (optional, for production)

---

Good luck with your deployment! 🚀


