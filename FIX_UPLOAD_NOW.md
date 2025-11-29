# 🚨 FIX UPLOAD ISSUE NOW - Step by Step Guide

## The Problem

Your Cloudinary environment variables are **NOT set** on your running Cloud Run service. This is why uploads are failing.

## ✅ Quick Fix (2 Minutes)

### Step 1: Go to Cloud Run Console
👉 **Click here:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables

Or navigate manually:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** → **europe-west1** → **khair-backend-autodeploy**

### Step 2: Edit Service
1. Click **"EDIT & DEPLOY NEW REVISION"** button (top of the page)
2. Scroll down to **"Variables & Secrets"** section
3. Click **"Variables & Secrets"** tab

### Step 3: Add Environment Variables
Click **"+ ADD VARIABLE"** and add these **3 variables**:

| Variable Name | Value |
|--------------|-------|
| `CLOUDINARY_CLOUD_NAME` | `dlsobyta0` |
| `CLOUDINARY_API_KEY` | `778583779232949` |
| `CLOUDINARY_API_SECRET` | `j5iHrKcFMgoUZYDxRNMAFR5z0vM` |

**Important:** Make sure you add all 3 variables!

### Step 4: Deploy
1. Scroll to the bottom
2. Click **"DEPLOY"** button
3. Wait 30-60 seconds for deployment to complete

### Step 5: Test
1. Go to: https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
2. Try uploading an image
3. It should work! 🎉

---

## 🔍 Verify Environment Variables Are Set

After deploying, verify the variables are set:

### Option 1: Check in Console
1. Go back to: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
2. You should see all 3 `CLOUDINARY_*` variables listed

### Option 2: Check Logs
1. Go to: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
2. Look for log entries that show:
   ```
   [Cloudinary Config] Initializing with: { cloudName: 'dls***', apiKey: '778***', apiSecret: 'SET', ... }
   ```
3. If you see `MISSING` for any value, the variable is not set correctly

---

## 🐛 Troubleshooting

### Still Getting "Cloudinary configuration is missing" Error?

1. **Double-check variable names** - They must be EXACTLY:
   - `CLOUDINARY_CLOUD_NAME` (not `CLOUDINARY_CLOUDNAME`)
   - `CLOUDINARY_API_KEY` (not `CLOUDINARY_KEY`)
   - `CLOUDINARY_API_SECRET` (not `CLOUDINARY_SECRET`)

2. **Check for typos** - Copy and paste the values exactly:
   - Cloud Name: `dlsobyta0`
   - API Key: `778583779232949`
   - API Secret: `j5iHrKcFMgoUZYDxRNMAFR5z0vM`

3. **Wait for deployment** - After clicking DEPLOY, wait 30-60 seconds for the new revision to be ready

4. **Check service logs** - Look for errors:
   ```
   https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
   ```

### Using gcloud CLI?

If you have `gcloud` CLI installed, you can update via command line:

```bash
gcloud run services update khair-backend-autodeploy \
  --region europe-west1 \
  --update-env-vars "CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

---

## 📋 Why This Happened

Your `cloudbuild.yaml` file has the environment variables configured, but:

1. **Automatic Deployments**: If you're using Cloud Build triggers (connected to GitHub), it might not be using your `cloudbuild.yaml` file
2. **Manual Deployments**: If you deployed manually without using `cloudbuild.yaml`, the variables weren't set
3. **Service Mismatch**: Previous deployments might have been to a different service name

**Solution**: The `cloudbuild.yaml` is now fixed, but you need to manually set the variables on the currently running service.

---

## ✅ After Fixing

Once the environment variables are set:

1. ✅ Uploads will work immediately
2. ✅ Images will be stored in Cloudinary
3. ✅ Future deployments via `cloudbuild.yaml` will automatically include these variables
4. ✅ No more "Cloudinary configuration is missing" errors

---

## 🔗 Quick Links

- **Set Environment Variables:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
- **View Logs:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
- **Admin Panel:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
- **Service Overview:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy

---

**Need help?** Check the logs first, then verify the environment variables are set correctly.
