# Troubleshooting "Service Unavailable" Error

## Quick Diagnosis Steps

### 1. Check Cloud Run Service Status
```bash
# Replace SERVICE_NAME and REGION with your values
gcloud run services describe SERVICE_NAME --region REGION

# Check if service is ready
gcloud run services list --region REGION
```

### 2. View Service Logs
```bash
# View recent logs
gcloud run services logs read SERVICE_NAME --region REGION --limit 50

# Follow logs in real-time
gcloud run services logs tail SERVICE_NAME --region REGION
```

### 3. Check Container Startup
Look for these in the logs:
- ✅ "Ready" message from Next.js
- ✅ "Listening on port 8080" or similar
- ❌ Database connection errors
- ❌ Prisma migration errors
- ❌ Port binding errors

---

## Common Issues and Fixes

### Issue 1: Next.js Not Binding to PORT

**Symptoms:**
- Service shows as "Ready" but returns 503
- Logs show "EADDRINUSE" or port binding errors

**Fix:** Next.js 16 should auto-detect PORT, but let's verify:

```bash
# Check if PORT env var is set in Cloud Run
gcloud run services describe SERVICE_NAME --region REGION \
  --format="value(spec.template.spec.containers[0].env)"
```

**Solution:** Ensure PORT is set (Cloud Run sets it automatically, but verify).

### Issue 2: Database Connection Failing

**Symptoms:**
- Logs show Prisma connection errors
- Health check returns 503
- "ENOENT" errors for database file

**Fix:**
```bash
# Verify DATABASE_URL is set correctly
gcloud run services describe SERVICE_NAME --region REGION \
  --format="value(spec.template.spec.containers[0].env)" | grep DATABASE_URL

# Should show: DATABASE_URL=file:/data/dev.db
```

**Solution:** Update environment variable:
```bash
gcloud run services update SERVICE_NAME \
  --region REGION \
  --set-env-vars "DATABASE_URL=file:/data/dev.db"
```

### Issue 3: Container Crashing on Startup

**Symptoms:**
- Service shows "Unavailable"
- Logs show container exit codes
- Migration errors

**Check logs for:**
- Prisma migration failures
- Missing dependencies
- Permission errors

**Fix:** Check the startup command in Dockerfile CMD

### Issue 4: Health Check Failing

**Symptoms:**
- Service marked as unhealthy
- Health endpoint returns 503

**Test health endpoint:**
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format 'value(status.url)')

# Test health endpoint
curl $SERVICE_URL/api/health
```

---

## Debugging Commands

### Get Service URL
```bash
gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format 'value(status.url)'
```

### Check Service Configuration
```bash
gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format yaml
```

### Test Service Locally (if you have Docker)
```bash
# Build locally
docker build -t al-khair-test .

# Run with same env vars as Cloud Run
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL="file:/data/dev.db" \
  al-khair-test

# Test
curl http://localhost:8080/api/health
```

### Execute Command in Running Container
```bash
# Connect to container (if service is running)
gcloud run services update SERVICE_NAME \
  --region REGION \
  --exec-command "/bin/sh"
```

---

## Step-by-Step Fix

### Step 1: Check Logs
```bash
gcloud run services logs read SERVICE_NAME --region REGION --limit 100
```

Look for:
- Error messages
- "Ready" confirmation
- Port binding confirmation

### Step 2: Verify Environment Variables
```bash
gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format="value(spec.template.spec.containers[0].env)"
```

Should show:
- `PORT=8080` (set by Cloud Run automatically)
- `NODE_ENV=production`
- `DATABASE_URL=file:/data/dev.db`

### Step 3: Update Service if Needed
```bash
gcloud run services update SERVICE_NAME \
  --region REGION \
  --set-env-vars "DATABASE_URL=file:/data/dev.db,NODE_ENV=production" \
  --memory 512Mi \
  --timeout 300
```

### Step 4: Test Health Endpoint
```bash
SERVICE_URL=$(gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format 'value(status.url)')

curl -v $SERVICE_URL/api/health
```

### Step 5: Check Service Status
```bash
gcloud run services describe SERVICE_NAME \
  --region REGION \
  --format="value(status.conditions)"
```

---

## Quick Fix Script

Save this as `check-service.sh`:

```bash
#!/bin/bash
SERVICE_NAME="al-khair"
REGION="us-central1"

echo "🔍 Checking service status..."
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.conditions)"

echo ""
echo "📋 Environment Variables:"
gcloud run services describe $SERVICE_NAME --region $REGION \
  --format="value(spec.template.spec.containers[0].env)"

echo ""
echo "📊 Recent Logs:"
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20

echo ""
echo "🌐 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION \
  --format 'value(status.url)'
```

---

## If Still Not Working

1. **Rebuild and Redeploy:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/al-khair .
   gcloud run deploy al-khair \
     --image gcr.io/PROJECT_ID/al-khair \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Check Build Logs:**
   ```bash
   gcloud builds list --limit=1
   gcloud builds log BUILD_ID
   ```

3. **Increase Timeout:**
   ```bash
   gcloud run services update SERVICE_NAME \
     --region REGION \
     --timeout 300
   ```

4. **Increase Memory:**
   ```bash
   gcloud run services update SERVICE_NAME \
     --region REGION \
     --memory 1Gi
   ```

---

## Expected Log Output (Success)

When working correctly, you should see:
```
✓ Ready in X seconds
○ Compiling / ...
✓ Compiled successfully
- ready started server on 0.0.0.0:8080
```

If you see errors instead, share the log output for further diagnosis.






