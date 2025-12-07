#!/bin/bash
# ===========================================
# Setup Google Cloud Secret Manager Secrets
# ===========================================
# Run this script before deploying to Cloud Run
# Usage: ./scripts/setup-secrets.sh

set -e

echo "🔐 Setting up Google Cloud Secret Manager secrets..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project: $PROJECT_ID"
echo ""

# Function to create or update a secret
create_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    local DESCRIPTION=$3

    echo "Creating secret: $SECRET_NAME"
    
    # Check if secret exists
    if gcloud secrets describe "$SECRET_NAME" &>/dev/null; then
        echo "  → Secret exists, adding new version..."
        echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
    else
        echo "  → Creating new secret..."
        echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
            --data-file=- \
            --labels="app=al-khair,env=production"
    fi
    echo "  ✅ Done"
}

# Prompt for values
echo "Please enter the following values (they will be stored securely):"
echo ""

read -p "DATABASE_URL (MongoDB connection string): " DATABASE_URL
read -p "CLOUDINARY_API_KEY: " CLOUDINARY_API_KEY
read -p "CLOUDINARY_API_SECRET: " CLOUDINARY_API_SECRET

# Generate secure random values for passwords
ADMIN_PASSWORD=$(openssl rand -base64 32)
SEED_SECRET_TOKEN=$(openssl rand -base64 32)

echo ""
echo "🔑 Generated secure values:"
echo "  ADMIN_PASSWORD: $ADMIN_PASSWORD"
echo "  SEED_SECRET_TOKEN: $SEED_SECRET_TOKEN"
echo ""
echo "⚠️  SAVE THESE VALUES SECURELY - they won't be shown again!"
echo ""

read -p "Press Enter to continue creating secrets..."

# Create secrets
echo ""
echo "Creating secrets in Secret Manager..."
echo ""

create_secret "DATABASE_URL" "$DATABASE_URL" "MongoDB connection string"
create_secret "CLOUDINARY_API_KEY" "$CLOUDINARY_API_KEY" "Cloudinary API key"
create_secret "CLOUDINARY_API_SECRET" "$CLOUDINARY_API_SECRET" "Cloudinary API secret"
create_secret "ADMIN_PASSWORD" "$ADMIN_PASSWORD" "Admin panel password"
create_secret "SEED_SECRET_TOKEN" "$SEED_SECRET_TOKEN" "Database seed authorization token"

echo ""
echo "✅ All secrets created successfully!"
echo ""

# Grant access to Cloud Run service account
echo "🔓 Granting Cloud Run access to secrets..."

# Get the default compute service account
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Also try the compute service account
COMPUTE_SA="$(gcloud iam service-accounts list \
    --filter='email~compute@developer.gserviceaccount.com' \
    --format='value(email)' 2>/dev/null || echo '')"

if [ -n "$COMPUTE_SA" ]; then
    SERVICE_ACCOUNT="$COMPUTE_SA"
fi

echo "Service Account: $SERVICE_ACCOUNT"

for SECRET in DATABASE_URL CLOUDINARY_API_KEY CLOUDINARY_API_SECRET ADMIN_PASSWORD SEED_SECRET_TOKEN; do
    echo "  Granting access to $SECRET..."
    gcloud secrets add-iam-policy-binding "$SECRET" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true
done

echo ""
echo "============================================"
echo "✅ SETUP COMPLETE"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Deploy: gcloud builds submit --config=cloudbuild.yaml"
echo "2. Seed database (once):"
echo "   curl -X POST https://YOUR_SERVICE_URL/api/seed \\"
echo "     -H \"Authorization: Bearer $SEED_SECRET_TOKEN\""
echo ""
echo "Admin access:"
echo "   Username: admin"
echo "   Password: $ADMIN_PASSWORD"
echo ""

