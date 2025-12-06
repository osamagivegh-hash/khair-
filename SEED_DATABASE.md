# How to Seed the Database

The database is empty after deployment. You need to seed it with initial data for the hero slider and programs to display.

## Option 1: Use the Seed API Endpoint (Recommended)

After deployment, call this endpoint to seed the database:

```bash
curl -X POST https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed
```

Or visit in browser (though POST is required, you can use a tool like Postman or curl).

**Using curl:**
```bash
curl -X POST https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "slides": 5,
  "programs": 6,
  "news": 4
}
```

## Option 2: Auto-Seed on Startup (Already Configured)

The Dockerfile is configured to automatically seed the database on first startup. However, if the database already exists, it won't re-seed.

To force re-seeding, you can:
1. Delete the database file (it will be recreated)
2. Or call the seed API endpoint

## Option 3: Use Cloud Run Jobs

Create a Cloud Run Job to seed the database:

```bash
gcloud run jobs create seed-db \
  --image gcr.io/PROJECT_ID/al-khair \
  --command "npm" \
  --args "run,seed" \
  --set-env-vars "DATABASE_URL=file:/data/dev.db" \
  --region europe-west1

# Execute the job
gcloud run jobs execute seed-db --region europe-west1
```

## Verify Seeding

After seeding, check:
1. Visit the homepage - hero slider should display
2. Programs section should show 6 programs
3. Health endpoint: `https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/health`

## What Gets Seeded

- **5 Slides** for the hero slider
- **6 Programs** for the programs section
- **4 News items** (2 breaking news)






