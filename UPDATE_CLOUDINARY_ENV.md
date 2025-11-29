# Update Cloudinary Environment Variables

The Cloudinary environment variables need to be set in your Cloud Run service. If you're seeing the error "Cloudinary configuration is missing", follow these steps:

## Option 1: Update via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Run** → **al-khair** service
3. Click **Edit & Deploy New Revision**
4. Go to **Variables & Secrets** tab
5. Add/Update these environment variables:
   - `CLOUDINARY_CLOUD_NAME` = `dlsobyta0`
   - `CLOUDINARY_API_KEY` = `778583779232949`
   - `CLOUDINARY_API_SECRET` = `j5iHrKcFMgoUZYDxRNMAFR5z0vM`
6. Click **Deploy**

## Option 2: Update via gcloud CLI

If you have `gcloud` CLI installed, run:

```bash
# Set your project ID (replace with your actual project ID)
PROJECT_ID="your-project-id"
REGION="us-central1"  # or your region
SERVICE_NAME="al-khair"

# Update environment variables
gcloud run services update "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --update-env-vars "CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

## Option 3: Re-deploy with deploy.sh

The `deploy.sh` script already includes Cloudinary variables. Simply re-run:

```bash
./deploy.sh [PROJECT_ID] [REGION] [SERVICE_NAME]
```

## Option 4: Use the update script

If you have bash available:

```bash
chmod +x update-cloudinary-env.sh
./update-cloudinary-env.sh [PROJECT_ID] [REGION] [SERVICE_NAME]
```

## Verify Environment Variables

After updating, verify the variables are set:

```bash
gcloud run services describe al-khair \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

You should see all three `CLOUDINARY_*` variables listed.

## Quick Fix Command (Copy & Paste)

Replace `YOUR_PROJECT_ID` and `YOUR_REGION` with your actual values:

```bash
gcloud run services update al-khair \
  --project YOUR_PROJECT_ID \
  --region YOUR_REGION \
  --update-env-vars "CLOUDINARY_CLOUD_NAME=dlsobyta0,CLOUDINARY_API_KEY=778583779232949,CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM"
```

## Environment Variables Summary

```
CLOUDINARY_CLOUD_NAME=dlsobyta0
CLOUDINARY_API_KEY=778583779232949
CLOUDINARY_API_SECRET=j5iHrKcFMgoUZYDxRNMAFR5z0vM
```

After updating, the service will automatically restart with the new environment variables. Wait 30-60 seconds for the service to be ready, then try uploading an image again.

