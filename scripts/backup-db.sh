#!/bin/bash
# Database backup script
# Uploads current database to Cloud Storage

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-${GCP_PROJECT}}"
BUCKET_NAME="${DB_BUCKET:-${PROJECT_ID}-sqlite-db}"
DB_PATH="/data/dev.db"
BACKUP_FILE="dev.db.backup.$(date +%Y%m%d_%H%M%S)"

echo "💾 Backing up database..."

if [ ! -f "$DB_PATH" ]; then
  echo "❌ Database file not found at $DB_PATH"
  exit 1
fi

# Upload current database
if gsutil cp "$DB_PATH" "gs://${BUCKET_NAME}/dev.db"; then
  echo "✅ Database backed up to gs://${BUCKET_NAME}/dev.db"
else
  echo "❌ Failed to backup database"
  exit 1
fi

# Create timestamped backup
if gsutil cp "$DB_PATH" "gs://${BUCKET_NAME}/${BACKUP_FILE}"; then
  echo "✅ Timestamped backup created: ${BACKUP_FILE}"
else
  echo "⚠️  Failed to create timestamped backup (continuing...)"
fi

# Keep only last 7 backups
echo "🧹 Cleaning old backups (keeping last 7)..."
gsutil ls "gs://${BUCKET_NAME}/dev.db.backup.*" 2>/dev/null | \
  sort -r | \
  tail -n +8 | \
  xargs -r gsutil rm 2>/dev/null || true

echo "✅ Backup complete"






