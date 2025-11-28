#!/bin/bash
# Google Cloud Run Deployment Script
# Usage: ./deploy.sh [PROJECT_ID] [REGION] [SERVICE_NAME]

set -e

# Configuration
PROJECT_ID="${1:-${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-al-khair}"
BUCKET_NAME="${PROJECT_ID}-sqlite-db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Error: PROJECT_ID not set${NC}"
  echo "Usage: ./deploy.sh [PROJECT_ID] [REGION] [SERVICE_NAME]"
  echo "Or set GOOGLE_CLOUD_PROJECT environment variable"
  exit 1
fi

echo -e "${GREEN}🚀 Starting deployment to Google Cloud Run${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}❌ Error: gcloud CLI not found${NC}"
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Set project
echo -e "${YELLOW}📦 Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable storage.googleapis.com --quiet

# Create Cloud Storage bucket for database (if it doesn't exist)
echo -e "${YELLOW}📦 Creating Cloud Storage bucket for database...${NC}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
  gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET_NAME}"
  echo -e "${GREEN}✅ Bucket created: gs://${BUCKET_NAME}${NC}"
else
  echo -e "${GREEN}✅ Bucket already exists: gs://${BUCKET_NAME}${NC}"
fi

# Upload initial database if it exists locally
if [ -f "dev.db" ] || [ -f "prisma/dev.db" ]; then
  echo -e "${YELLOW}📤 Uploading initial database to Cloud Storage...${NC}"
  DB_FILE="dev.db"
  if [ -f "prisma/dev.db" ]; then
    DB_FILE="prisma/dev.db"
  fi
  gsutil cp "$DB_FILE" "gs://${BUCKET_NAME}/dev.db"
  echo -e "${GREEN}✅ Database uploaded${NC}"
else
  echo -e "${YELLOW}⚠️  No local database found. A new database will be created on first run.${NC}"
fi

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
IMAGE_URL="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
gcloud builds submit --tag "$IMAGE_URL" --quiet

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
  echo -e "${RED}❌ Docker build failed${NC}"
  exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_URL" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "DATABASE_URL=file:/data/dev.db,NODE_ENV=production,DB_BUCKET=${BUCKET_NAME}" \
  --quiet

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  
  # Get service URL
  SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region "$REGION" \
    --format 'value(status.url)')
  
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ Deployment Complete!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "🌐 Service URL: $SERVICE_URL"
  echo "📊 Health Check: $SERVICE_URL/api/health"
  echo "💾 Database Bucket: gs://${BUCKET_NAME}"
  echo ""
  echo "Next steps:"
  echo "1. Visit $SERVICE_URL to view your application"
  echo "2. Check health: $SERVICE_URL/api/health"
  echo "3. View logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
  echo ""
else
  echo -e "${RED}❌ Deployment failed${NC}"
  exit 1
fi

