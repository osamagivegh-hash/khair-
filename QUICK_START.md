# Quick Start: Deploy to Google Cloud Run

## 🚀 Fastest Deployment Path

### 1. Prerequisites (One-time setup)
```bash
# Install Google Cloud SDK
# Windows: Download from https://cloud.google.com/sdk/docs/install
# macOS: brew install --cask google-cloud-sdk
# Linux: curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login
gcloud auth configure-docker
```

### 2. Set Your Project
```bash
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID
```

### 3. Deploy (One Command)
```bash
# Make deploy script executable (Linux/macOS)
chmod +x deploy.sh

# Run deployment
./deploy.sh $PROJECT_ID us-central1 al-khair
```

**Windows PowerShell:**
```powershell
$env:GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
bash deploy.sh $env:GOOGLE_CLOUD_PROJECT us-central1 al-khair
```

### 4. Access Your App
After deployment, you'll get a URL like:
```
https://al-khair-xxxxx-uc.a.run.app
```

Visit the URL and check health:
```
https://al-khair-xxxxx-uc.a.run.app/api/health
```

---

## 📋 Manual Deployment Steps

If you prefer step-by-step:

### Step 1: Create Cloud Storage Bucket
```bash
gsutil mb -p $PROJECT_ID -l us-central1 gs://$PROJECT_ID-sqlite-db
```

### Step 2: Upload Database (if you have one)
```bash
gsutil cp dev.db gs://$PROJECT_ID-sqlite-db/dev.db
# OR
gsutil cp prisma/dev.db gs://$PROJECT_ID-sqlite-db/dev.db
```

### Step 3: Build Docker Image
```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/al-khair
```

### Step 4: Deploy
```bash
gcloud run deploy al-khair \
  --image gcr.io/$PROJECT_ID/al-khair \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "DATABASE_URL=file:/data/dev.db,NODE_ENV=production"
```

---

## ⚠️ Important Notes

### Database Persistence
- **Cloud Run filesystem is ephemeral** - data is lost on container restart
- **Recommended**: Use Cloud Storage bucket for database persistence
- The deployment script automatically creates a bucket and uploads your database

### First Run
- If no database exists, Prisma will create one automatically
- Run migrations: They execute automatically on startup
- Seed data: Use Cloud Run Jobs (see CLOUD_DEPLOYMENT.md)

### Environment Variables
- `DATABASE_URL=file:/data/dev.db` - Set automatically
- `NODE_ENV=production` - Set automatically
- `PORT=8080` - Set by Cloud Run automatically

---

## 🔍 Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe al-khair \
  --region us-central1 \
  --format 'value(status.url)')

# Check health
curl $SERVICE_URL/api/health

# View logs
gcloud run services logs read al-khair --region us-central1
```

---

## 📚 Full Documentation

For detailed information, see [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md)

---

## 🆘 Troubleshooting

### Build fails
```bash
# Check build logs
gcloud builds list --limit=1
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')
```

### Service won't start
```bash
# Check service logs
gcloud run services logs read al-khair --region us-central1 --limit=50
```

### Database issues
```bash
# Verify database in Cloud Storage
gsutil ls gs://$PROJECT_ID-sqlite-db/

# Check database path in container
gcloud run services update al-khair --exec-command "ls -la /data/"
```

---

**Need help?** Check [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) for comprehensive guide.






