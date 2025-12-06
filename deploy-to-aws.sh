#!/bin/bash

# Al-Khair AWS Deployment Script
# This script helps deploy the application to AWS ECS Fargate

set -e

echo "🚀 Al-Khair AWS Deployment Script"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    echo "Visit: https://www.docker.com/get-started"
    exit 1
fi

# Get AWS Account ID and Region
echo ""
echo "📋 Getting AWS Account Information..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "✅ Account ID: $AWS_ACCOUNT_ID"
echo "✅ Region: $AWS_REGION"

# Prompt for environment variables
echo ""
echo "🔐 Please provide your environment variables:"
read -p "MongoDB Database URL: " DATABASE_URL
read -p "Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "Cloudinary API Key: " CLOUDINARY_API_KEY
read -sp "Cloudinary API Secret: " CLOUDINARY_API_SECRET
echo ""

# Confirm deployment
echo ""
echo "📝 Deployment Summary:"
echo "  - AWS Account: $AWS_ACCOUNT_ID"
echo "  - Region: $AWS_REGION"
echo "  - Database: ${DATABASE_URL:0:20}..."
echo ""
read -p "Do you want to proceed with deployment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Step 1: Create ECR Repository
echo ""
echo "📦 Step 1: Creating ECR Repository..."
aws ecr describe-repositories --repository-names al-khair --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name al-khair --region $AWS_REGION
echo "✅ ECR Repository ready"

# Step 2: Store Secrets in Secrets Manager
echo ""
echo "🔐 Step 2: Storing secrets in AWS Secrets Manager..."

create_or_update_secret() {
    SECRET_NAME=$1
    SECRET_VALUE=$2
    
    aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $AWS_REGION 2>/dev/null && \
    aws secretsmanager update-secret --secret-id $SECRET_NAME --secret-string "$SECRET_VALUE" --region $AWS_REGION || \
    aws secretsmanager create-secret --name $SECRET_NAME --secret-string "$SECRET_VALUE" --region $AWS_REGION
}

create_or_update_secret "al-khair/DATABASE_URL" "$DATABASE_URL"
create_or_update_secret "al-khair/CLOUDINARY_CLOUD_NAME" "$CLOUDINARY_CLOUD_NAME"
create_or_update_secret "al-khair/CLOUDINARY_API_KEY" "$CLOUDINARY_API_KEY"
create_or_update_secret "al-khair/CLOUDINARY_API_SECRET" "$CLOUDINARY_API_SECRET"
create_or_update_secret "al-khair/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "$CLOUDINARY_CLOUD_NAME"

echo "✅ Secrets stored successfully"

# Step 3: Deploy CloudFormation Stack
echo ""
echo "🏗️  Step 3: Deploying infrastructure with CloudFormation..."
echo "   (This may take 10-15 minutes...)"

aws cloudformation describe-stacks --stack-name al-khair-infrastructure --region $AWS_REGION 2>/dev/null && \
aws cloudformation update-stack \
  --stack-name al-khair-infrastructure \
  --template-body file://aws-cloudformation-template.yaml \
  --parameters ParameterKey=ContainerImage,ParameterValue=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $AWS_REGION 2>/dev/null || \
aws cloudformation create-stack \
  --stack-name al-khair-infrastructure \
  --template-body file://aws-cloudformation-template.yaml \
  --parameters ParameterKey=ContainerImage,ParameterValue=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $AWS_REGION

echo "⏳ Waiting for stack deployment..."
aws cloudformation wait stack-create-complete --stack-name al-khair-infrastructure --region $AWS_REGION 2>/dev/null || \
aws cloudformation wait stack-update-complete --stack-name al-khair-infrastructure --region $AWS_REGION 2>/dev/null

echo "✅ Infrastructure deployed successfully"

# Step 4: Build and Push Docker Image
echo ""
echo "🐳 Step 4: Building and pushing Docker image..."

# Login to ECR
echo "   Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build image
echo "   Building Docker image..."
docker build -f Dockerfile.aws -t al-khair:latest .

# Tag image
echo "   Tagging image..."
docker tag al-khair:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest

# Push image
echo "   Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest

echo "✅ Docker image pushed successfully"

# Step 5: Update Task Definition
echo ""
echo "📋 Step 5: Updating ECS Task Definition..."

# Create temporary task definition file
TEMP_TASK_DEF=$(mktemp)
sed -e "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
    -e "s/YOUR_REGION/$AWS_REGION/g" \
    aws-ecs-task-definition.json > $TEMP_TASK_DEF

# Register task definition
aws ecs register-task-definition --cli-input-json file://$TEMP_TASK_DEF --region $AWS_REGION

# Clean up
rm $TEMP_TASK_DEF

echo "✅ Task definition updated"

# Step 6: Update ECS Service
echo ""
echo "🔄 Step 6: Updating ECS Service..."
aws ecs update-service \
  --cluster al-khair-prod-cluster \
  --service al-khair-prod-service \
  --force-new-deployment \
  --region $AWS_REGION

echo "✅ Service update initiated"

# Step 7: Get Load Balancer URL
echo ""
echo "🌐 Getting your application URL..."
sleep 5
LB_URL=$(aws cloudformation describe-stacks \
  --stack-name al-khair-infrastructure \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text \
  --region $AWS_REGION)

echo ""
echo "=================================="
echo "✅ Deployment Completed Successfully!"
echo "=================================="
echo ""
echo "🌐 Your application URL: $LB_URL"
echo ""
echo "📝 Next Steps:"
echo "  1. Wait 5-10 minutes for the service to be fully deployed"
echo "  2. Visit your application URL"
echo "  3. Set up custom domain (optional)"
echo "  4. Configure CloudWatch alarms"
echo ""
echo "🔍 Monitor deployment:"
echo "  aws ecs describe-services --cluster al-khair-prod-cluster --services al-khair-prod-service --region $AWS_REGION"
echo ""
echo "📊 View logs:"
echo "  aws logs tail /ecs/al-khair-prod-app --follow --region $AWS_REGION"
echo ""
echo "🎉 Happy deploying!"


