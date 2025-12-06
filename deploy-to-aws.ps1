# Al-Khair AWS Deployment Script (PowerShell)
# This script helps deploy the application to AWS ECS Fargate

$ErrorActionPreference = "Stop"

Write-Host "🚀 Al-Khair AWS Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
} catch {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://www.docker.com/get-started" -ForegroundColor Yellow
    exit 1
}

# Get AWS Account ID and Region
Write-Host ""
Write-Host "📋 Getting AWS Account Information..." -ForegroundColor Yellow
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "✅ Account ID: $AWS_ACCOUNT_ID" -ForegroundColor Green
Write-Host "✅ Region: $AWS_REGION" -ForegroundColor Green

# Prompt for environment variables
Write-Host ""
Write-Host "🔐 Please provide your environment variables:" -ForegroundColor Yellow
$DATABASE_URL = Read-Host "MongoDB Database URL"
$CLOUDINARY_CLOUD_NAME = Read-Host "Cloudinary Cloud Name"
$CLOUDINARY_API_KEY = Read-Host "Cloudinary API Key"
$CLOUDINARY_API_SECRET = Read-Host "Cloudinary API Secret" -AsSecureString
$CLOUDINARY_API_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($CLOUDINARY_API_SECRET)
)

# Confirm deployment
Write-Host ""
Write-Host "📝 Deployment Summary:" -ForegroundColor Yellow
Write-Host "  - AWS Account: $AWS_ACCOUNT_ID"
Write-Host "  - Region: $AWS_REGION"
Write-Host "  - Database: $($DATABASE_URL.Substring(0, [Math]::Min(20, $DATABASE_URL.Length)))..."
Write-Host ""
$CONFIRM = Read-Host "Do you want to proceed with deployment? (yes/no)"

if ($CONFIRM -ne "yes") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 0
}

# Function to create or update secret
function Set-AWSSecret {
    param (
        [string]$SecretName,
        [string]$SecretValue,
        [string]$Region
    )
    
    try {
        aws secretsmanager describe-secret --secret-id $SecretName --region $Region 2>$null
        aws secretsmanager update-secret --secret-id $SecretName --secret-string $SecretValue --region $Region
    } catch {
        aws secretsmanager create-secret --name $SecretName --secret-string $SecretValue --region $Region
    }
}

# Step 1: Create ECR Repository
Write-Host ""
Write-Host "📦 Step 1: Creating ECR Repository..." -ForegroundColor Yellow
try {
    aws ecr describe-repositories --repository-names al-khair --region $AWS_REGION 2>$null
} catch {
    aws ecr create-repository --repository-name al-khair --region $AWS_REGION
}
Write-Host "✅ ECR Repository ready" -ForegroundColor Green

# Step 2: Store Secrets in Secrets Manager
Write-Host ""
Write-Host "🔐 Step 2: Storing secrets in AWS Secrets Manager..." -ForegroundColor Yellow

Set-AWSSecret -SecretName "al-khair/DATABASE_URL" -SecretValue $DATABASE_URL -Region $AWS_REGION
Set-AWSSecret -SecretName "al-khair/CLOUDINARY_CLOUD_NAME" -SecretValue $CLOUDINARY_CLOUD_NAME -Region $AWS_REGION
Set-AWSSecret -SecretName "al-khair/CLOUDINARY_API_KEY" -SecretValue $CLOUDINARY_API_KEY -Region $AWS_REGION
Set-AWSSecret -SecretName "al-khair/CLOUDINARY_API_SECRET" -SecretValue $CLOUDINARY_API_SECRET_PLAIN -Region $AWS_REGION
Set-AWSSecret -SecretName "al-khair/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -SecretValue $CLOUDINARY_CLOUD_NAME -Region $AWS_REGION

Write-Host "✅ Secrets stored successfully" -ForegroundColor Green

# Step 3: Deploy CloudFormation Stack
Write-Host ""
Write-Host "🏗️  Step 3: Deploying infrastructure with CloudFormation..." -ForegroundColor Yellow
Write-Host "   (This may take 10-15 minutes...)" -ForegroundColor Cyan

$CONTAINER_IMAGE = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest"

try {
    aws cloudformation describe-stacks --stack-name al-khair-infrastructure --region $AWS_REGION 2>$null
    aws cloudformation update-stack `
        --stack-name al-khair-infrastructure `
        --template-body file://aws-cloudformation-template.yaml `
        --parameters "ParameterKey=ContainerImage,ParameterValue=$CONTAINER_IMAGE" `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $AWS_REGION 2>$null
} catch {
    aws cloudformation create-stack `
        --stack-name al-khair-infrastructure `
        --template-body file://aws-cloudformation-template.yaml `
        --parameters "ParameterKey=ContainerImage,ParameterValue=$CONTAINER_IMAGE" `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $AWS_REGION
}

Write-Host "⏳ Waiting for stack deployment..." -ForegroundColor Cyan
try {
    aws cloudformation wait stack-create-complete --stack-name al-khair-infrastructure --region $AWS_REGION 2>$null
} catch {
    aws cloudformation wait stack-update-complete --stack-name al-khair-infrastructure --region $AWS_REGION 2>$null
}

Write-Host "✅ Infrastructure deployed successfully" -ForegroundColor Green

# Step 4: Build and Push Docker Image
Write-Host ""
Write-Host "🐳 Step 4: Building and pushing Docker image..." -ForegroundColor Yellow

Write-Host "   Logging in to ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "   Building Docker image..." -ForegroundColor Cyan
docker build -f Dockerfile.aws -t al-khair:latest .

Write-Host "   Tagging image..." -ForegroundColor Cyan
docker tag al-khair:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest"

Write-Host "   Pushing to ECR..." -ForegroundColor Cyan
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/al-khair:latest"

Write-Host "✅ Docker image pushed successfully" -ForegroundColor Green

# Step 5: Update Task Definition
Write-Host ""
Write-Host "📋 Step 5: Updating ECS Task Definition..." -ForegroundColor Yellow

$TEMP_TASK_DEF = [System.IO.Path]::GetTempFileName()
(Get-Content aws-ecs-task-definition.json) `
    -replace 'YOUR_ACCOUNT_ID', $AWS_ACCOUNT_ID `
    -replace 'YOUR_REGION', $AWS_REGION | Set-Content $TEMP_TASK_DEF

aws ecs register-task-definition --cli-input-json "file://$TEMP_TASK_DEF" --region $AWS_REGION

Remove-Item $TEMP_TASK_DEF

Write-Host "✅ Task definition updated" -ForegroundColor Green

# Step 6: Update ECS Service
Write-Host ""
Write-Host "🔄 Step 6: Updating ECS Service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster al-khair-prod-cluster `
    --service al-khair-prod-service `
    --force-new-deployment `
    --region $AWS_REGION

Write-Host "✅ Service update initiated" -ForegroundColor Green

# Step 7: Get Load Balancer URL
Write-Host ""
Write-Host "🌐 Getting your application URL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$LB_URL = aws cloudformation describe-stacks `
    --stack-name al-khair-infrastructure `
    --query 'Stacks[0].Outputs[?OutputKey==``LoadBalancerURL``].OutputValue' `
    --output text `
    --region $AWS_REGION

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your application URL: $LB_URL" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 5-10 minutes for the service to be fully deployed"
Write-Host "  2. Visit your application URL"
Write-Host "  3. Set up custom domain (optional)"
Write-Host "  4. Configure CloudWatch alarms"
Write-Host ""
Write-Host "🔍 Monitor deployment:" -ForegroundColor Yellow
Write-Host "  aws ecs describe-services --cluster al-khair-prod-cluster --services al-khair-prod-service --region $AWS_REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Yellow
Write-Host "  aws logs tail /ecs/al-khair-prod-app --follow --region $AWS_REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Cyan


