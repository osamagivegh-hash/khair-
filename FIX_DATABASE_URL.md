# 🔧 Fix Missing DATABASE_URL

## Current Status

Your diagnostic endpoint shows:
- ✅ **Cloudinary**: Configured
- ❌ **Database**: Missing `DATABASE_URL`

## Quick Fix (2 Minutes)

### Step 1: Go to Cloud Run Console
👉 **Click here:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables

Or navigate manually:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** → **europe-west1** → **khair-backend-autodeploy**

### Step 2: Edit Service
1. Click **"EDIT & DEPLOY NEW REVISION"** button (top of the page)
2. Scroll down to **"Variables & Secrets"** section
3. Click **"Variables & Secrets"** tab

### Step 3: Add DATABASE_URL
Click **"+ ADD VARIABLE"** and add:

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | `mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah` |

**Important:** Make sure you copy the entire connection string exactly!

### Step 4: Verify All Variables
You should now have **4 environment variables** total:

1. ✅ `DATABASE_URL` = `mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah`
2. ✅ `CLOUDINARY_CLOUD_NAME` = `dlsobyta0`
3. ✅ `CLOUDINARY_API_KEY` = `778583779232949`
4. ✅ `CLOUDINARY_API_SECRET` = `j5iHrKcFMgoUZYDxRNMAFR5z0vM`

### Step 5: Deploy
1. Scroll to the bottom
2. Click **"DEPLOY"** button
3. Wait 30-60 seconds for deployment to complete

### Step 6: Verify
Visit the diagnostic endpoint:
```
https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
```

You should now see:
```json
{
  "cloudinary": {
    "configured": true,
    "status": "✅ Configured"
  },
  "database": {
    "configured": true,
    "status": "✅ Configured"
  }
}
```

---

## Using gcloud CLI

If you have `gcloud` CLI installed:

```bash
gcloud run services update khair-backend-autodeploy \
  --region europe-west1 \
  --update-env-vars "DATABASE_URL=mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah"
```

Or update all variables at once:

```bash
gcloud run services update khair-backend-autodeploy \
  --region europe-west1 \
  --update-env-vars "DATABASE_URL=mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah,NODE_ENV=production,CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

---

## Why This Happened

Your `cloudbuild.yaml` file has `DATABASE_URL` configured, but:

1. **Automatic Deployments**: If you're using Cloud Build triggers (connected to GitHub), it might not be using your `cloudbuild.yaml` file
2. **Manual Deployments**: If you deployed manually without using `cloudbuild.yaml`, the variable wasn't set
3. **Service Mismatch**: Previous deployments might have been to a different service

**Solution**: The `cloudbuild.yaml` is configured correctly, but you need to manually set the variable on the currently running service.

---

## After Fixing

Once `DATABASE_URL` is set:

1. ✅ Database connections will work
2. ✅ Admin dashboard will load data
3. ✅ API endpoints will function correctly
4. ✅ Health check will pass

---

## 🔗 Quick Links

- **Set Environment Variables:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
- **Check Configuration:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
- **Health Check:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/health
- **Admin Panel:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin

---

## Complete Environment Variables List

For reference, here are all the environment variables your service needs:

```
DATABASE_URL=mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=dlsobyta0
CLOUDINARY_API_KEY=778583779232949
CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM
```

**Note:** `PORT` is automatically set by Cloud Run, you don't need to set it manually.



