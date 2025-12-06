# Admin Dashboard Guide

## 🎯 Overview

A comprehensive admin dashboard has been created to manage all website content including:
- **Hero Slides** (شرائح البطل)
- **Programs** (المشاريع)
- **News** (الأخبار)

All images are uploaded to Cloudinary instead of using external URLs.

## 🔗 Access the Dashboard

After deployment, visit:
```
https://your-service-url.run.app/admin
```

## 📸 Cloudinary Configuration

**Credentials:**
- Cloud Name: `dlsobyta0`
- API Key: `778583779232949`
- API Secret: `j5iHrKcFMgoUZYDxRNMAFR5z0vM`

**Image Upload:**
- All images are uploaded to Cloudinary
- Images are organized in folders:
  - `al-khair/slides` - Hero slider images
  - `al-khair/programs` - Program images
- Maximum file size: 10MB
- Supported formats: JPG, PNG, WEBP, GIF

## 🎨 Features

### 1. Hero Slides Management
- Add new slides with title, subtitle, and image
- Edit existing slides
- Delete slides
- Set display order
- Images uploaded to Cloudinary

### 2. Programs Management
- Add new charity programs
- Edit programs (title, description, amounts, category)
- Delete programs
- Upload program images to Cloudinary
- Set target and raised amounts

### 3. News Management
- Add news articles
- Mark news as "breaking" (عاجل)
- Edit and delete news
- No images needed for news (text only)

## 📁 File Structure

```
app/
├── admin/
│   └── page.tsx              # Admin dashboard main page
├── api/
│   ├── upload/
│   │   └── route.ts          # Image upload endpoint
│   └── admin/
│       ├── slides/           # Slides CRUD API
│       ├── programs/         # Programs CRUD API
│       └── news/             # News CRUD API

components/
└── admin/
    ├── ImageUpload.tsx       # Image upload component
    ├── SlidesManager.tsx     # Slides management UI
    ├── ProgramsManager.tsx   # Programs management UI
    └── NewsManager.tsx       # News management UI

lib/
└── cloudinary.ts            # Cloudinary configuration
```

## 🚀 API Endpoints

### Image Upload
```
POST /api/upload
Body: FormData with 'file' and 'folder'
Response: { success: true, url: "https://..." }
```

### Slides
- `GET /api/admin/slides` - Get all slides
- `POST /api/admin/slides` - Create slide
- `PUT /api/admin/slides/[id]` - Update slide
- `DELETE /api/admin/slides/[id]` - Delete slide

### Programs
- `GET /api/admin/programs` - Get all programs
- `POST /api/admin/programs` - Create program
- `PUT /api/admin/programs/[id]` - Update program
- `DELETE /api/admin/programs/[id]` - Delete program

### News
- `GET /api/admin/news` - Get all news
- `POST /api/admin/news` - Create news
- `PUT /api/admin/news/[id]` - Update news
- `DELETE /api/admin/news/[id]` - Delete news

## 🔒 Security Note

**Important:** The admin dashboard is currently open to everyone. For production, you should:

1. Add authentication (e.g., NextAuth.js)
2. Add role-based access control
3. Protect admin routes with middleware

## 📝 Usage Instructions

### Adding a Hero Slide:
1. Go to `/admin`
2. Click "شرائح البطل" tab
3. Click "إضافة شريحة جديدة"
4. Fill in title, subtitle
5. Upload image (will be saved to Cloudinary)
6. Set order number
7. Click "إضافة"

### Adding a Program:
1. Go to `/admin`
2. Click "المشاريع" tab
3. Click "إضافة مشروع جديد"
4. Fill in all fields
5. Upload program image
6. Click "إضافة"

### Adding News:
1. Go to `/admin`
2. Click "الأخبار" tab
3. Click "إضافة خبر جديد"
4. Fill in title and content
5. Check "خبر عاجل" if breaking news
6. Click "إضافة"

## 🎨 UI Features

- **Arabic RTL Support** - Full right-to-left layout
- **Image Preview** - See images before uploading
- **Drag & Drop** - Easy image upload
- **Real-time Updates** - Changes reflect immediately
- **Responsive Design** - Works on all devices

---

**Ready to use!** Visit `/admin` after deployment to start managing your content.






