#!/bin/bash
# Update Cloudinary environment variables in Cloud Run service

set -e

# Configuration
PROJECT_ID="${1:-${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}}"
REGION="${2:-europe-west1}"
SERVICE_NAME="${3:-khair-backend-autodeploy}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Error: PROJECT_ID not set${NC}"
  echo "Usage: ./update-cloudinary-env.sh [PROJECT_ID] [REGION] [SERVICE_NAME]"
  echo "Or set GOOGLE_CLOUD_PROJECT environment variable"
  exit 1
fi

echo -e "${GREEN}🔧 Updating Cloudinary environment variables in Cloud Run${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Set project
gcloud config set project "$PROJECT_ID"

# Update environment variables
echo -e "${YELLOW}📝 Setting Cloudinary environment variables...${NC}"
gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --update-env-vars "CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM" \
  --quiet

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Cloudinary environment variables updated successfully!${NC}"
  echo ""
  echo "The service will automatically restart with the new environment variables."
  echo "Wait a few seconds for the service to be ready."
else
  echo -e "${RED}❌ Failed to update environment variables${NC}"
  exit 1
fi

