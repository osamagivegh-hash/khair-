# 🔒 Security Hardening Guide

This document explains the security improvements made to prevent Google Cloud Run suspension.

## Why Was the Service Suspended?

Google Cloud Run detected patterns that looked like cryptocurrency mining:
1. **Database seeding on every container startup** - caused 100% CPU spikes
2. **Unprotected debug endpoints** - could be spammed to cause resource exhaustion
3. **No rate limiting** - allowed unlimited requests

## Changes Made

### 1. Dockerfile (Critical Fix)
- **REMOVED** automatic database seeding from container startup
- Seeding should be done ONCE via protected API endpoint or Cloud Run Job

### 2. Protected Endpoints
All these endpoints now require authentication:
- `/api/seed` - Requires `SEED_SECRET_TOKEN` Bearer token
- `/api/admin/*` - Requires Basic Auth with `ADMIN_USERNAME`/`ADMIN_PASSWORD`

### 3. Disabled Debug Endpoints
These endpoints are now disabled in production:
- `/api/test-db`
- `/api/debug-upload`
- `/api/test-cloudinary`
- `/api/check-env`

### 4. Rate Limiting
All API endpoints now have rate limiting:
- Standard endpoints: 60 requests/minute per IP
- Sensitive endpoints: 10 requests/minute per IP

### 5. Secrets Management
Secrets are now stored in Google Secret Manager, not in code.

## Setup Instructions

### 1. Create Secrets in Google Secret Manager

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create secrets (you'll be prompted to enter values)
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/db" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "your_cloudinary_api_key" | \
  gcloud secrets create CLOUDINARY_API_KEY --data-file=-

echo -n "your_cloudinary_api_secret" | \
  gcloud secrets create CLOUDINARY_API_SECRET --data-file=-

# Generate secure passwords
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create ADMIN_PASSWORD --data-file=-

echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create SEED_SECRET_TOKEN --data-file=-
```

### 2. Grant Cloud Run Access to Secrets

```bash
# Get the Cloud Run service account
export SERVICE_ACCOUNT="$(gcloud run services describe al-khair \
  --region=europe-west1 \
  --format='value(spec.template.spec.serviceAccountName)')"

# If empty, use the default compute service account
if [ -z "$SERVICE_ACCOUNT" ]; then
  export SERVICE_ACCOUNT="$(gcloud iam service-accounts list \
    --filter='email~compute@developer.gserviceaccount.com' \
    --format='value(email)')"
fi

# Grant access to each secret
for SECRET in DATABASE_URL CLOUDINARY_API_KEY CLOUDINARY_API_SECRET ADMIN_PASSWORD SEED_SECRET_TOKEN; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 3. Deploy

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### 4. Seed Database (One Time Only)

After deployment, seed the database ONCE:

```bash
# Get your seed token from Secret Manager
SEED_TOKEN=$(gcloud secrets versions access latest --secret=SEED_SECRET_TOKEN)

# Seed the database
curl -X POST "https://your-service.run.app/api/seed" \
  -H "Authorization: Bearer $SEED_TOKEN"
```

## Admin Access

To access admin endpoints, use Basic Authentication:

```bash
# Get admin password from Secret Manager
ADMIN_PASS=$(gcloud secrets versions access latest --secret=ADMIN_PASSWORD)

# Create a news item
curl -X POST "https://your-service.run.app/api/admin/news" \
  -u "admin:$ADMIN_PASS" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Test content", "isBreaking": false}'
```

## Monitoring

### Check for Abuse Patterns

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=al-khair" \
  --limit=100 \
  --format="table(timestamp,textPayload)"

# Check for rate limit hits
gcloud logging read "resource.type=cloud_run_revision AND textPayload:\"Too many requests\"" \
  --limit=50
```

### Cloud Run Metrics to Watch
- CPU utilization (should not be at 100% constantly)
- Request count (watch for spikes)
- Instance count (should not scale uncontrollably)

## Checklist Before Redeployment

- [ ] All secrets created in Secret Manager
- [ ] Cloud Run service account has access to secrets
- [ ] `cloudbuild.yaml` uses `--set-secrets` not `--set-env-vars` for sensitive data
- [ ] Dockerfile does NOT run seed script on startup
- [ ] Debug endpoints are disabled
- [ ] Rate limiting is enabled
- [ ] Test locally with `npm run build && npm start`

## Contact

If Google suspends the service again, check:
1. Cloud Run logs for CPU/memory spikes
2. Request patterns for potential abuse
3. Background processes that shouldn't be running

