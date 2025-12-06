#!/bin/bash
# Database sync script for Cloud Run
# Downloads database from Cloud Storage on startup

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-${GCP_PROJECT}}"
BUCKET_NAME="${DB_BUCKET:-${PROJECT_ID}-sqlite-db}"
DB_PATH="/data/dev.db"

echo "🔄 Syncing database from Cloud Storage..."

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
  echo "⚠️  gsutil not found, skipping database sync"
  echo "📝 Creating empty database if it doesn't exist..."
  mkdir -p /data
  touch "$DB_PATH" || true
  chmod 666 "$DB_PATH" || true
  exit 0
fi

# Try to download database from Cloud Storage
if gsutil -q cp "gs://${BUCKET_NAME}/dev.db" "$DB_PATH"; then
  echo "✅ Database downloaded from Cloud Storage"
  chmod 666 "$DB_PATH"
else
  echo "⚠️  Database not found in Cloud Storage (gs://${BUCKET_NAME}/dev.db)"
  echo "📝 Creating new database..."
  mkdir -p /data
  touch "$DB_PATH" || true
  chmod 666 "$DB_PATH" || true
fi

echo "✅ Database sync complete"






