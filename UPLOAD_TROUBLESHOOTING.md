# 🔧 Upload Troubleshooting Guide

## Current Status Check

First, verify your configuration:

1. **Check Environment Variables:**
   ```
   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
   ```
   Should show both Cloudinary and Database as ✅ Configured

2. **Test Cloudinary Connection:**
   ```
   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/test-cloudinary
   ```
   This will test if Cloudinary credentials are working

## Common Issues & Solutions

### Issue 1: "Cloudinary configuration is missing"

**Symptoms:**
- Error message: "Cloudinary configuration is missing"
- Upload fails immediately

**Solution:**
1. Go to Cloud Run Console: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
2. Verify these 3 variables exist:
   - `CLOUDINARY_CLOUD_NAME` = `dlsobyta0`
   - `CLOUDINARY_API_KEY` = `778583779232949`
   - `CLOUDINARY_API_SECRET` = `j5iHrKcFMgoUZYDxRNMAFR5z0vM`
3. If missing, add them and redeploy

### Issue 2: "Cloudinary connection failed" or 401/403 errors

**Symptoms:**
- Test endpoint shows connection failed
- HTTP 401 or 403 errors
- "Invalid API key" or "Unauthorized" errors

**Possible Causes:**
1. **Wrong API Credentials:**
   - Double-check the Cloudinary dashboard
   - Verify API Key and Secret are correct
   - Make sure there are no extra spaces in the values

2. **API Key Disabled:**
   - Check Cloudinary dashboard → Settings → Security
   - Ensure API key is enabled

3. **IP Restrictions:**
   - Cloudinary might have IP restrictions
   - Cloud Run IPs are dynamic, so IP restrictions won't work
   - Remove IP restrictions in Cloudinary dashboard

**Solution:**
1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Navigate to Settings → Security
3. Verify API Key and Secret match what's in Cloud Run
4. Check if IP restrictions are enabled (disable them for Cloud Run)
5. Update Cloud Run environment variables if needed

### Issue 3: Upload times out or hangs

**Symptoms:**
- Upload starts but never completes
- No error message, just hangs
- Browser shows "pending" status

**Possible Causes:**
1. **Large file size:**
   - Current limit is 10MB
   - Cloud Run has request timeout limits

2. **Network issues:**
   - Slow connection to Cloudinary
   - Cloud Run timeout (default 300s)

**Solution:**
1. Try a smaller image (< 5MB)
2. Check Cloud Run logs for timeout errors
3. Verify file is actually an image (not corrupted)

### Issue 4: "Invalid file type" error

**Symptoms:**
- Error: "Invalid file type. Only images are allowed."

**Solution:**
- Ensure file is one of: JPEG, JPG, PNG, WEBP, GIF
- Check file extension matches actual file type
- Try converting the image to a standard format

### Issue 5: CORS or Network Errors

**Symptoms:**
- Browser console shows CORS errors
- "Network request failed"
- "Failed to fetch"

**Solution:**
- This shouldn't happen (same origin)
- Check browser console for specific error
- Verify you're accessing the correct URL
- Try clearing browser cache

## Diagnostic Steps

### Step 1: Check Logs

Go to Cloud Run logs:
```
https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
```

Look for:
- `[Cloudinary Upload]` entries
- `=== UPLOAD ERROR ===` entries
- Any error messages

### Step 2: Test Endpoints

1. **Configuration Check:**
   ```
   GET /api/check-env
   ```
   Should show Cloudinary as configured

2. **Cloudinary Connection Test:**
   ```
   GET /api/test-cloudinary
   ```
   Should return `success: true` with connection status

3. **Try Upload:**
   - Go to admin dashboard
   - Try uploading a small test image (< 1MB)
   - Check browser console for errors
   - Check Cloud Run logs

### Step 3: Verify Cloudinary Account

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Check:
   - Account is active
   - API Key and Secret are correct
   - No usage limits exceeded
   - Storage quota not full

## Quick Fix Checklist

- [ ] Environment variables set in Cloud Run
- [ ] Cloudinary credentials are correct
- [ ] Test endpoint shows connection successful
- [ ] File is valid image format
- [ ] File size < 10MB
- [ ] No IP restrictions in Cloudinary
- [ ] Cloud Run service is running
- [ ] Check Cloud Run logs for specific errors

## Still Not Working?

1. **Check Cloud Run Logs:**
   - Look for detailed error messages
   - Check the exact error from Cloudinary

2. **Test with cURL:**
   ```bash
   curl -X POST https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/test-cloudinary
   ```

3. **Verify Cloudinary Dashboard:**
   - Check if uploads appear in Cloudinary dashboard
   - Verify account status
   - Check API usage/limits

4. **Contact Support:**
   - Share the error message from logs
   - Share the response from `/api/test-cloudinary`
   - Share Cloud Run logs

## 🔗 Quick Links

- **Check Config:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env
- **Test Cloudinary:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/test-cloudinary
- **Cloud Run Logs:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/logs
- **Environment Variables:** https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy/variables
- **Admin Dashboard:** https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
- **Cloudinary Dashboard:** https://console.cloudinary.com/



