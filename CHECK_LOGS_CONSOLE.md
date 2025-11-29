# 📊 How to Check Cloud Run Logs in Google Cloud Console

## Quick Access Links

- **Service Name:** `khair-backend-autodeploy`
- **Region:** `europe-west1`
- **URL:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app

---

## Step-by-Step Guide

### 1. Access Cloud Run Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** (search for "Cloud Run" in the top search bar)
3. Make sure you're in the correct project
4. Click on your service: **khair-backend-autodeploy**

### 2. View Logs

**Option A: From Service Overview**
1. On the service page, click the **"LOGS"** tab at the top
2. You'll see real-time logs

**Option B: Direct Logs Link**
👉 **Click here:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs

### 3. Filter Logs

Use the search box to filter logs:

**Check Cloudinary Configuration:**
```
[Cloudinary Config]
```

**Check Upload Errors:**
```
[Cloudinary Upload] OR upload OR error
```

**Check All Errors:**
```
error OR ERROR OR failed OR FAILED
```

---

## What to Look For

### ✅ Good Signs (Configuration Working)

```
[Cloudinary Config] Initializing with: { cloudName: 'dls***', apiKey: '778***', apiSecret: 'SET', env: 'production' }
[Cloudinary Upload] Starting upload to folder: al-khair
[Cloudinary Upload] Upload successful: { url: 'https://res.cloudinary.com/...', ... }
```

### ❌ Bad Signs (Configuration Missing)

```
[Cloudinary Config] ERROR: Missing required environment variables!
[Cloudinary Config] CRITICAL: Cannot configure Cloudinary - missing environment variables!
Cloudinary configuration is missing. Please check environment variables.
```

### 🔍 Upload Errors

```
[Cloudinary Upload] Upload failed: { message: '...', http_code: 401 }
[Cloudinary Upload] Configuration error: Cloudinary is not properly configured
```

---

## Check Environment Variables

### Via Console

1. Go to: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
2. Or: Service page → **"VARIABLES & SECRETS"** tab
3. Look for:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Via Diagnostic Endpoint

Visit this URL in your browser:
```
https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
```

You should see:
```json
{
  "cloudinary": {
    "configured": true,
    "variables": {
      "CLOUDINARY_CLOUD_NAME": "dls***",
      "CLOUDINARY_API_KEY": "778***",
      "CLOUDINARY_API_SECRET": "SET"
    },
    "status": "✅ Configured"
  }
}
```

If you see `"configured": false` or `"MISSING"`, the environment variables are not set!

---

## Common Log Patterns

### Successful Upload Flow

```
1. [Cloudinary Config] Initializing with: { ... }
2. Cloudinary config check: { hasCloudName: true, hasApiKey: true, hasApiSecret: true }
3. Upload request: { hasFile: true, fileName: 'image.jpg', ... }
4. [Cloudinary Upload] Starting upload to folder: al-khair
5. [Cloudinary Upload] Upload successful: { url: 'https://...', ... }
```

### Failed Upload Flow (Missing Config)

```
1. [Cloudinary Config] ERROR: Missing required environment variables!
2. Cloudinary config check: { hasCloudName: false, hasApiKey: false, hasApiSecret: false }
3. Missing Cloudinary configuration
4. Return 500 error: "Cloudinary configuration is missing"
```

---

## Using gcloud CLI

If you have `gcloud` CLI installed:

```bash
# View recent logs
gcloud run services logs read khair-backend-autodeploy \
  --region europe-west1 \
  --limit 50

# Follow logs in real-time
gcloud run services logs tail khair-backend-autodeploy \
  --region europe-west1

# Filter for Cloudinary logs
gcloud run services logs read khair-backend-autodeploy \
  --region europe-west1 \
  --limit 100 | grep -i cloudinary

# Check environment variables
gcloud run services describe khair-backend-autodeploy \
  --region europe-west1 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## Quick Troubleshooting

### Problem: "Cloudinary configuration is missing"

**Solution:**
1. Go to: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
2. Add the 3 Cloudinary environment variables
3. Deploy new revision
4. Check logs again

### Problem: Upload fails with 401/403 error

**Solution:**
1. Verify API credentials are correct
2. Check Cloudinary dashboard for API key/secret
3. Ensure no extra spaces in environment variable values

### Problem: Can't see logs

**Solution:**
1. Make sure you're in the correct Google Cloud project
2. Check you have "Cloud Run Viewer" or "Cloud Run Admin" permissions
3. Try refreshing the page

---

## 🔗 Quick Links

- **Service Overview:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy
- **Logs:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
- **Environment Variables:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
- **Your Website:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app
- **Admin Panel:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
- **Check Env Endpoint:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
