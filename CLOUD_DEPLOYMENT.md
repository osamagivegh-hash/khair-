# Google Cloud Run Deployment Guide

## 📋 Table of Contents
1. [Project Architecture Summary](#1-project-architecture-summary)
2. [Prerequisites](#2-prerequisites)
3. [SQLite Persistence Strategy](#3-sqlite-persistence-strategy)
4. [Build and Deploy Commands](#4-build-and-deploy-commands)
5. [Environment Variables Setup](#5-environment-variables-setup)
6. [Database Migration and Seeding](#6-database-migration-and-seeding)
7. [Troubleshooting](#7-troubleshooting)
8. [Recommended Modifications](#8-recommended-modifications)
9. [Final Checklist](#9-final-checklist)

---

## 1. Project Architecture Summary

### Detected Stack:
- **Framework**: Next.js 16.0.3 (App Router)
- **Runtime**: Node.js 20
- **ORM**: Prisma 5.22.0
- **Database**: SQLite (dev.db)
- **Database Location**: 
  - Local: `./dev.db` or `./prisma/dev.db`
  - Production: `/data/dev.db` (inside container)

### Project Structure:
```
al-khair/
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server actions (Prisma queries)
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/            # React components
├── lib/
│   └── prisma.ts         # Prisma client singleton
├── prisma/
│   ├── schema.prisma     # Database schema (SQLite)
│   ├── migrations/       # Prisma migrations
│   └── seed.ts           # Database seeding script
└── dev.db                # SQLite database file
```

### Key Features:
- ✅ Server-side rendering with Next.js App Router
- ✅ Prisma ORM with SQLite
- ✅ No hardcoded localhost URLs (Next.js handles this)
- ✅ CORS handled automatically by Next.js
- ✅ Dynamic port binding (uses `PORT` env var)

---

## 2. Prerequisites

### Install Google Cloud SDK:
```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# macOS
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
```

### Authenticate and Set Project:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker
```

### Enable Required APIs:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

---

## 3. SQLite Persistence Strategy

### ⚠️ Important: Cloud Run Filesystem Limitations

Cloud Run's filesystem is **ephemeral** - all files are deleted when the container stops. This means:
- ❌ SQLite database will be lost on container restart
- ❌ Data written during runtime will be lost
- ❌ Migrations need to be run on each deployment

### ✅ Recommended Solution: Cloud Storage Bucket

**Best Practice**: Use Google Cloud Storage to persist the SQLite database file.

#### Option A: Cloud Storage with Startup Sync (Recommended)

1. **Create a Cloud Storage bucket:**
```bash
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://YOUR_PROJECT_ID-sqlite-db
```

2. **Upload your initial database:**
```bash
# Upload your local database
gsutil cp dev.db gs://YOUR_PROJECT_ID-sqlite-db/dev.db

# Or if database is in prisma folder
gsutil cp prisma/dev.db gs://YOUR_PROJECT_ID-sqlite-db/dev.db
```

3. **Update Dockerfile to sync on startup:**
```dockerfile
# Add to Dockerfile CMD (already included in our Dockerfile)
CMD ["sh", "-c", "gsutil cp gs://YOUR_PROJECT_ID-sqlite-db/dev.db /data/dev.db || true && npx prisma migrate deploy || true && npm start"]
```

4. **Create a sync script for periodic backups:**
```bash
# This runs periodically to backup database to Cloud Storage
gsutil cp /data/dev.db gs://YOUR_PROJECT_ID-sqlite-db/dev.db
```

#### Option B: Cloud Storage FUSE (Advanced)

Mount Cloud Storage as a filesystem (requires additional setup):
```bash
gcloud run services update YOUR_SERVICE \
  --add-volume=name=db-storage,type=cloud-storage,bucket=YOUR_BUCKET \
  --add-volume-mount=volume=db-storage,mount-path=/data
```

#### Option C: Ephemeral Storage (Development Only)

For development/testing, you can use ephemeral storage, but **data will be lost**:
- Database is created fresh on each container start
- Migrations run automatically
- Seed data can be added via startup script

---

## 4. Build and Deploy Commands

### Step 1: Build the Docker Image

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"  # or your preferred region
export SERVICE_NAME="al-khair"

# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
```

### Step 2: Deploy to Cloud Run

```bash
# Deploy with public access (for web app)
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "DATABASE_URL=file:/data/dev.db,NODE_ENV=production" \
  --set-secrets "API_KEY=api-key:latest" \
  --service-account YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com
```

### Step 3: Set Up Cloud Storage Sync (Recommended)

Create a startup script that syncs database from Cloud Storage:

```bash
# Create a startup script
cat > sync-db.sh << 'EOF'
#!/bin/bash
# Download database from Cloud Storage if it exists
gsutil cp gs://$PROJECT_ID-sqlite-db/dev.db /data/dev.db || {
  echo "Database not found in Cloud Storage, creating new one..."
  touch /data/dev.db
  chmod 666 /data/dev.db
}
EOF

chmod +x sync-db.sh
```

Update Dockerfile to include this script and gsutil:

```dockerfile
# Add to Dockerfile
RUN apt-get update && apt-get install -y \
    sqlite3 \
    gsutil \
    && rm -rf /var/lib/apt/lists/*
```

### Complete Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="al-khair"
BUCKET_NAME="$PROJECT_ID-sqlite-db"

echo "🚀 Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

echo "📦 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "DATABASE_URL=file:/data/dev.db,NODE_ENV=production" \
  --timeout 300

echo "✅ Deployment complete!"
echo "🌐 Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
```

---

## 5. Environment Variables Setup

### Required Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `file:/data/dev.db` | SQLite database path in container |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `8080` | Server port (auto-set by Cloud Run) |

### Using Google Secret Manager:

For sensitive keys (API keys, tokens, etc.):

```bash
# Create a secret
echo -n "your-secret-value" | gcloud secrets create api-key --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding api-key \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Reference in deployment
gcloud run services update $SERVICE_NAME \
  --set-secrets "API_KEY=api-key:latest"
```

### Access Secrets in Code:

```typescript
// lib/secrets.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/latest`,
  });
  return version.payload?.data?.toString() || '';
}
```

---

## 6. Database Migration and Seeding

### Automatic Migration on Startup:

The Dockerfile includes:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy || true && npm start"]
```

This runs migrations automatically on container start.

### Manual Migration (if needed):

```bash
# Connect to running container
gcloud run services update $SERVICE_NAME --exec-command "npx prisma migrate deploy"

# Or via Cloud Run Jobs
gcloud run jobs create migrate-db \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --command "npx" \
  --args "prisma,migrate,deploy"
```

### Seeding Database:

```bash
# Create a Cloud Run Job for seeding
gcloud run jobs create seed-db \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --command "npm" \
  --args "run,seed" \
  --set-env-vars "DATABASE_URL=file:/data/dev.db"

# Execute the job
gcloud run jobs execute seed-db
```

Or add to Dockerfile startup:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy || true && (npm run seed || true) && npm start"]
```

---

## 7. Troubleshooting

### Common Issues:

#### Issue 1: Database Permission Denied
```bash
# Fix: Ensure /data directory has write permissions
RUN chmod 777 /data
RUN chmod 666 /data/dev.db
```

#### Issue 2: Database Not Found
```bash
# Check if database exists in container
gcloud run services update $SERVICE_NAME --exec-command "ls -la /data/"

# Ensure DATABASE_URL points to correct path
gcloud run services describe $SERVICE_NAME --format="value(spec.template.spec.containers[0].env)"
```

#### Issue 3: Prisma Client Not Generated
```bash
# Ensure prisma generate runs in Dockerfile
RUN npx prisma generate
```

#### Issue 4: Port Binding Issues
```bash
# Next.js automatically uses PORT env var
# Cloud Run sets PORT automatically
# Verify in logs:
gcloud run services logs read $SERVICE_NAME --limit 50
```

#### Issue 5: Database Lost on Restart
```bash
# Solution: Use Cloud Storage sync (see Section 3)
# Or implement periodic backup job
```

### View Logs:
```bash
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100
```

### Debug Container:
```bash
gcloud run services update $SERVICE_NAME --exec-command "/bin/sh"
```

---

## 8. Recommended Modifications

### A. Add Health Check Endpoint

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', error: String(error) },
      { status: 503 }
    );
  }
}
```

### B. Add Database Backup Job

Create `scripts/backup-db.sh`:
```bash
#!/bin/bash
PROJECT_ID=$(gcloud config get-value project)
BUCKET="gs://$PROJECT_ID-sqlite-db"
BACKUP_FILE="dev.db.backup.$(date +%Y%m%d_%H%M%S)"

# Copy current database to backup
gsutil cp $BUCKET/dev.db $BUCKET/$BACKUP_FILE

# Keep only last 7 backups
gsutil ls $BUCKET/dev.db.backup.* | sort -r | tail -n +8 | xargs -r gsutil rm
```

Schedule with Cloud Scheduler:
```bash
gcloud scheduler jobs create http backup-db \
  --schedule="0 2 * * *" \
  --uri="https://$REGION-$PROJECT_ID.cloudfunctions.net/backup-db" \
  --http-method=POST
```

### C. Add Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Set up alerts for errors
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Run Errors" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

### D. Optimize for Production

1. **Enable Caching:**
```typescript
// next.config.ts
export default {
  // ... existing config
  output: 'standalone', // For better Cloud Run performance
}
```

2. **Add Database Connection Pooling:**
```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

3. **Implement Retry Logic:**
```typescript
// lib/prisma.ts
const MAX_RETRIES = 3;
let retries = 0;

export const prisma = new PrismaClient();

// Add retry wrapper for critical operations
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      return withRetry(fn);
    }
    throw error;
  }
}
```

---

## 9. Final Checklist

### Pre-Deployment:
- [x] ✅ Dockerfile created and tested locally
- [x] ✅ .dockerignore configured
- [x] ✅ Environment variables documented
- [x] ✅ Database path configured for production (`/data/dev.db`)
- [x] ✅ Prisma migrations ready
- [x] ✅ No hardcoded localhost URLs
- [x] ✅ CORS configured (Next.js handles automatically)
- [x] ✅ Port binding uses `PORT` env var (Next.js default)

### Deployment:
- [ ] ☐ Google Cloud SDK installed and authenticated
- [ ] ☐ GCP project created and APIs enabled
- [ ] ☐ Cloud Storage bucket created for database persistence
- [ ] ☐ Initial database uploaded to Cloud Storage
- [ ] ☐ Docker image built successfully
- [ ] ☐ Cloud Run service deployed
- [ ] ☐ Environment variables set
- [ ] ☐ Secrets configured (if needed)
- [ ] ☐ Service URL accessible

### Post-Deployment:
- [ ] ☐ Health check endpoint responding
- [ ] ☐ Database migrations applied
- [ ] ☐ Database seeded (if needed)
- [ ] ☐ Application accessible via Cloud Run URL
- [ ] ☐ Database backup job configured
- [ ] ☐ Monitoring and alerts set up
- [ ] ☐ Logs reviewed for errors

### Testing:
- [ ] ☐ Test database read operations
- [ ] ☐ Test database write operations
- [ ] ☐ Test after container restart (data persistence)
- [ ] ☐ Test under load
- [ ] ☐ Verify Cloud Storage sync working

---

## Quick Reference Commands

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/al-khair

# Deploy
gcloud run deploy al-khair \
  --image gcr.io/PROJECT_ID/al-khair \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# View logs
gcloud run services logs read al-khair --region us-central1

# Update environment
gcloud run services update al-khair \
  --set-env-vars "DATABASE_URL=file:/data/dev.db"

# Backup database
gsutil cp /data/dev.db gs://PROJECT_ID-sqlite-db/dev.db

# Restore database
gsutil cp gs://PROJECT_ID-sqlite-db/dev.db /data/dev.db
```

---

## Support

For issues or questions:
1. Check Cloud Run logs: `gcloud run services logs read SERVICE_NAME`
2. Review this guide's troubleshooting section
3. Check Google Cloud Run documentation: https://cloud.google.com/run/docs

---

**Last Updated**: 2025-01-27
**Project**: Al-Khair Charity Website
**Deployment Target**: Google Cloud Run

