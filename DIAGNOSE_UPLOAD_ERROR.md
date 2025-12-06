# 🔍 How to Diagnose Upload Errors

Since Cloudinary is configured, let's find the actual error. Follow these steps:

## Step 1: Check Browser Console

1. Open your admin dashboard: https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
2. Open browser Developer Tools (F12)
3. Go to **Console** tab
4. Try uploading an image
5. Look for any red error messages
6. **Copy the exact error message**

## Step 2: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Try uploading an image
3. Find the request to `/api/upload`
4. Click on it
5. Check:
   - **Status Code** (should be 200, not 500)
   - **Response** tab - see the error message
   - **Headers** tab - check if CORS headers are present

## Step 3: Check Cloud Run Logs

1. Go to: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
2. Filter by: `upload` or `Cloudinary`
3. Look for entries that start with:
   - `=== UPLOAD ERROR ===`
   - `[Cloudinary Upload]`
   - Any error messages

## Step 4: Test Endpoints

### Test 1: Configuration Check
```
https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
```
Should show Cloudinary as ✅ Configured

### Test 2: Cloudinary Connection
```
https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/test-cloudinary
```
Should show `success: true`

### Test 3: Direct Upload Test (using curl)
```bash
curl -X POST https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/upload \
  -F "file=@test-image.jpg" \
  -F "folder=al-khair/test"
```

## Common Error Scenarios

### Error: "Cannot find module '@/lib/cors'"
**Fix:** The CORS file exists, but might need rebuild. Wait for deployment to complete.

### Error: "Cloudinary configuration is missing"
**Fix:** Even though you set it, verify in Cloud Run console that variables are actually saved.

### Error: CORS error in browser
**Fix:** Check if CORS headers are in the response (Network tab → Headers)

### Error: 401/403 from Cloudinary
**Fix:** API credentials might be wrong. Check Cloudinary dashboard.

### Error: Timeout
**Fix:** File might be too large or Cloudinary is slow. Try smaller file.

## What to Share

Please share:
1. **Browser console error** (exact message)
2. **Network tab response** (status code and response body)
3. **Cloud Run logs** (the error message from logs)
4. **Response from `/api/test-cloudinary`** (to verify connection)

This will help identify the exact issue!



