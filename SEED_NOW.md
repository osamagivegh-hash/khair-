# 🌱 Seed Your Database Now

Your deployment is complete! Now you need to seed the database with initial data.

## Quick Seed (Choose One Method)

### Method 1: Using curl (Command Line)

**In Cloud Shell or Terminal:**
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

### Method 2: Using Browser Extension

1. Install a REST client extension (like "REST Client" for Chrome)
2. Make a POST request to:
   ```
   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed
   ```

### Method 3: Using Postman

1. Open Postman
2. Create a new POST request
3. URL: `https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed`
4. Click "Send"

### Method 4: Using PowerShell (Windows)

```powershell
Invoke-WebRequest -Uri "https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed" -Method POST
```

## Verify It Worked

After seeding:

1. **Visit your homepage:**
   ```
   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/
   ```

2. **You should see:**
   - ✅ Hero slider with 5 slides rotating
   - ✅ Programs section with 6 charity programs
   - ✅ All content displaying properly

3. **Check health endpoint:**
   ```
   https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/health
   ```

## What Gets Seeded

- **5 Hero Slides** (سقيا الماء, كفالة الأيتام, مساجد, كسوة الشتاء, الإغاثة العاجلة)
- **6 Charity Programs** (كفالة يتيم, بناء مسجد, حفر بئر, etc.)
- **4 News Items** (2 breaking news, 2 regular news)

## Troubleshooting

If seeding fails:
1. Check that the service is running
2. Verify the database is accessible
3. Check Cloud Run logs for errors

```bash
gcloud run services logs read khair-backend-autodeploy --region europe-west1 --limit 20
```

---

**After seeding, your website will be fully functional! 🎉**






