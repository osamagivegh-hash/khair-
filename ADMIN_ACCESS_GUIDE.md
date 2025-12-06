# Admin Dashboard Access Guide

## 🌐 How to Access the Admin Dashboard

### After Deployment:

Visit your Cloud Run service URL + `/admin`:

```
https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin
```

### Local Development:

If running locally:
```
http://localhost:3000/admin
```

---

## 🔗 Frontend ↔ Backend Connection

**Yes, the frontend is fully connected to the backend endpoints!**

### How It Works:

1. **Admin Dashboard Page** (`app/admin/page.tsx`)
   - Main dashboard UI with tabs
   - Renders management components

2. **Management Components** (in `components/admin/`)
   - `SlidesManager.tsx` - Manages hero slides
   - `ProgramsManager.tsx` - Manages programs
   - `NewsManager.tsx` - Manages news
   - `ImageUpload.tsx` - Handles image uploads

3. **API Calls** - All components use `fetch()` to call backend:

### API Endpoints Used:

#### Image Upload:
```javascript
// In ImageUpload.tsx
fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

#### Slides Management:
```javascript
// Get all slides
fetch('/api/admin/slides')

// Create slide
fetch('/api/admin/slides', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Update slide
fetch(`/api/admin/slides/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

// Delete slide
fetch(`/api/admin/slides/${id}`, {
  method: 'DELETE'
})
```

#### Programs Management:
```javascript
// Get all programs
fetch('/api/admin/programs')

// Create program
fetch('/api/admin/programs', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Update program
fetch(`/api/admin/programs/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

// Delete program
fetch(`/api/admin/programs/${id}`, {
  method: 'DELETE'
})
```

#### News Management:
```javascript
// Get all news
fetch('/api/admin/news')

// Create news
fetch('/api/admin/news', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Update news
fetch(`/api/admin/news/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

// Delete news
fetch(`/api/admin/news/${id}`, {
  method: 'DELETE'
})
```

---

## 📊 Complete Flow

### Example: Adding a Hero Slide

1. **User visits** `/admin`
2. **Clicks** "إضافة شريحة جديدة" (Add new slide)
3. **Fills form** with title, subtitle
4. **Uploads image** → Frontend calls `/api/upload`
   - Image uploaded to Cloudinary
   - Returns Cloudinary URL
5. **Submits form** → Frontend calls `POST /api/admin/slides`
   - Backend saves to MongoDB
   - Returns created slide
6. **Frontend updates** → Shows new slide in list
7. **Homepage updates** → New slide appears in hero slider

### Example: Adding a Program

1. **User visits** `/admin` → "المشاريع" tab
2. **Clicks** "إضافة مشروع جديد"
3. **Fills form** (title, description, amounts, category)
4. **Uploads image** → `/api/upload` → Cloudinary
5. **Submits** → `POST /api/admin/programs` → MongoDB
6. **Program appears** in list and on homepage

---

## ✅ Verification

### Check if Frontend is Connected:

1. **Open browser console** (F12) when on `/admin`
2. **Try adding a slide** - you should see:
   - Network requests to `/api/upload`
   - Network requests to `/api/admin/slides`
3. **Check Network tab** - All API calls should succeed

### Test the Connection:

```javascript
// In browser console on /admin page:
fetch('/api/admin/slides')
  .then(r => r.json())
  .then(console.log)
```

Should return array of slides from MongoDB.

---

## 🎯 Quick Start

1. **Deploy** your application (already done)
2. **Visit** `https://your-service-url.run.app/admin`
3. **Start managing content:**
   - Upload hero slide images
   - Add programs with images
   - Create news articles
4. **Check homepage** - Changes appear immediately!

---

## 🔍 Troubleshooting

### Dashboard not loading?
- Check if service is deployed: Visit main URL first
- Check browser console for errors
- Verify API endpoints are accessible

### API calls failing?
- Check Cloud Run logs: `gcloud run services logs read SERVICE_NAME --region REGION`
- Verify MongoDB connection
- Check Cloudinary credentials

### Images not uploading?
- Check Cloudinary credentials in environment variables
- Verify network access
- Check file size (max 10MB)

---

**Everything is connected and ready to use!** 🎉






