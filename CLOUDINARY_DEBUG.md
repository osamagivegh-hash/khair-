# Cloudinary Upload Debugging Guide

## Issue
Upload API is returning 500 errors on Cloud Run despite Cloudinary environment variables being set.

## Changes Made

### 1. Enhanced Logging in `lib/cloudinary.ts`
- Removed hardcoded credential fallbacks that could mask configuration issues
- Added detailed logging at initialization to verify env vars are loaded
- Added comprehensive error logging in the upload function
- Added validation before attempting uploads

### 2. Enhanced Error Logging in `app/api/upload/route.ts`
- Added detailed error logging with full stack traces
- Logs all error properties to help diagnose the issue
- Returns error details in development mode

## How to Check Cloud Run Logs

### Option 1: Using Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Navigate to **Cloud Run** → Select your `al-khair` service
3. Click on the **LOGS** tab
4. Look for logs with these prefixes:
   - `[Cloudinary Config]` - Shows if env vars are loaded
   - `[Cloudinary Upload]` - Shows upload progress
   - `=== UPLOAD ERROR ===` - Shows detailed error information

### Option 2: Using gcloud CLI
```bash
# View recent logs
gcloud run services logs read al-khair --region=us-central1 --limit=100

# Follow logs in real-time
gcloud run services logs tail al-khair --region=us-central1

# Filter for errors only
gcloud run services logs read al-khair --region=us-central1 --limit=100 | grep -i error
```

## Verify Environment Variables on Cloud Run

### Check if env vars are set:
```bash
gcloud run services describe al-khair --region=us-central1 --format="value(spec.template.spec.containers[0].env)"
```

### Update environment variables (if needed):
```bash
gcloud run services update al-khair \
  --region=us-central1 \
  --set-env-vars="CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

## Common Issues and Solutions

### Issue 1: Environment Variables Not Set
**Symptoms:** Logs show `MISSING` for cloudName, apiKey, or apiSecret

**Solution:**
```bash
# Set environment variables via gcloud
gcloud run services update al-khair \
  --region=us-central1 \
  --set-env-vars="CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

### Issue 2: Invalid Cloudinary Credentials
**Symptoms:** Error message contains "Invalid credentials" or "Unauthorized"

**Solution:**
1. Verify credentials at https://console.cloudinary.com/
2. Update `cloudbuild.yaml` with correct credentials
3. Redeploy:
```bash
gcloud builds submit --config=cloudbuild.yaml
```

### Issue 3: Network/Firewall Issues
**Symptoms:** Timeout errors or connection refused

**Solution:**
- Ensure Cloud Run can access external APIs (it should by default)
- Check if Cloudinary API is accessible from your region

### Issue 4: File Size or Type Issues
**Symptoms:** Error about file validation

**Solution:**
- Check the upload route logs for file details
- Ensure file is under 10MB
- Ensure file type is one of: jpeg, jpg, png, webp, gif

## Testing the Upload

### 1. Test locally first (if possible):
```bash
# Make sure you have a .env file with Cloudinary credentials
npm run dev

# Then test upload through the admin panel
```

### 2. Test on Cloud Run:
1. Go to your deployed site's admin panel
2. Open browser DevTools (F12) → Console tab
3. Try uploading an image
4. Check both:
   - Browser console for client-side errors
   - Cloud Run logs for server-side errors

## Next Steps

1. **Deploy the changes:**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

2. **Check the logs immediately after deployment:**
   ```bash
   gcloud run services logs tail al-khair --region=us-central1
   ```

3. **Try uploading an image** and watch the logs in real-time

4. **Look for these log entries:**
   - `[Cloudinary Config] Initializing with:` - Should show credentials are loaded
   - `[Cloudinary Upload] Starting upload to folder:` - Upload attempt started
   - `[Cloudinary Upload] Upload successful:` - Upload completed
   - `=== UPLOAD ERROR ===` - If upload fails, this will show why

## Expected Log Output (Success)

```
[Cloudinary Config] Initializing with: {
  cloudName: 'dls***',
  apiKey: '778***',
  apiSecret: 'SET',
  env: 'production'
}
[Cloudinary Upload] Starting upload to folder: al-khair
[Cloudinary Upload] Converting File to Buffer: {
  name: 'image.jpg',
  type: 'image/jpeg',
  size: 123456
}
[Cloudinary Upload] Buffer size: 123456 bytes
[Cloudinary Upload] Upload successful: {
  url: 'https://res.cloudinary.com/...',
  public_id: 'al-khair/...',
  format: 'jpg'
}
```

## Expected Log Output (Failure - Missing Env Vars)

```
[Cloudinary Config] Initializing with: {
  cloudName: 'MISSING',
  apiKey: 'MISSING',
  apiSecret: 'MISSING',
  env: 'production'
}
[Cloudinary Config] ERROR: Missing required environment variables!
Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

## Contact

If you see the error logs but can't identify the issue, share:
1. The complete error log output
2. The output of the env vars check command
3. Any browser console errors
