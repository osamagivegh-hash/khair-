# 🛠️ Local Development Guide

## ✅ Setup Complete!

Your project is now running locally at:

**🌐 Local:** http://localhost:3000
**🌐 Network:** http://192.168.1.6:3000

---

## 🚀 Quick Start Commands

### Start Development Server
```bash
npm run dev
```
Server runs on: http://localhost:3000

### Access Admin Dashboard
```bash
# Navigate to:
http://localhost:3000/admin
```

### Seed Database (if empty)
```bash
# Windows
npm run seed:win

# Mac/Linux
npm run seed
```

### View Database (Prisma Studio)
```bash
npm run prisma:studio
```
Opens at: http://localhost:5555

---

## 📁 Project Structure

```
al-khair/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage
│   ├── admin/               # Admin dashboard
│   │   └── page.tsx
│   ├── api/                 # API routes
│   │   ├── health/          # Health check
│   │   ├── upload/          # Image upload
│   │   ├── news/            # News CRUD
│   │   ├── programs/        # Programs CRUD
│   │   └── slides/          # Slides CRUD
│   ├── actions.ts           # Server actions
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── admin/              # Admin components
│   │   ├── ImageUpload.tsx
│   │   ├── NewsManager.tsx
│   │   ├── ProgramsManager.tsx
│   │   └── SlidesManager.tsx
│   └── ui/                 # UI components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── HeroSlider.tsx
│       ├── NewsCard.tsx
│       ├── NewsTicker.tsx
│       ├── ProgramCard.tsx
│       └── ContactForm.tsx
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── cloudinary.ts       # Cloudinary config
│   └── upload-config.ts    # Upload settings
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── public/                  # Static files
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed:win` | Seed database (Windows) |
| `npm run seed` | Seed database (Mac/Linux) |
| `npm run db:push` | Sync Prisma schema to MongoDB |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:studio` | Open Prisma Studio |

---

## 📋 Environment Variables

Your `.env` file contains:

```bash
DATABASE_URL="mongodb+srv://..."           # MongoDB Atlas connection
CLOUDINARY_CLOUD_NAME="dlsobyta0"         # Cloudinary cloud name
CLOUDINARY_API_KEY="..."                  # Cloudinary API key
CLOUDINARY_API_SECRET="..."               # Cloudinary API secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."   # Public cloud name (frontend)
NODE_ENV="development"                     # Environment
PORT=3000                                  # Server port
```

---

## 🎯 Key Features

### Homepage
- ✅ Hero slider with dynamic slides
- ✅ Breaking news ticker
- ✅ News section with cards
- ✅ Programs/Projects section
- ✅ Vision/Mission section
- ✅ Contact form
- ✅ Responsive design

### Admin Dashboard (`/admin`)
- ✅ Manage slides (hero slider)
- ✅ Manage news (create, edit, delete)
- ✅ Manage programs (create, edit, delete)
- ✅ Image upload to Cloudinary
- ✅ Real-time updates

---

## 🧪 Testing the Application

### 1. Test Homepage
```
✓ Visit: http://localhost:3000
✓ Check: Hero slider displays
✓ Check: News section loads
✓ Check: Programs section loads
✓ Check: Contact form works
```

### 2. Test Admin Dashboard
```
✓ Visit: http://localhost:3000/admin
✓ Try: Upload an image
✓ Try: Create a news item
✓ Try: Create a program
✓ Try: Edit/Delete items
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Get all news
curl http://localhost:3000/api/news

# Get all programs
curl http://localhost:3000/api/programs

# Get all slides
curl http://localhost:3000/api/slides
```

---

## 🐛 Common Issues & Solutions

### Issue: Port 3000 already in use
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database connection fails
```
✓ Check MongoDB Atlas network access allows your IP
✓ Verify .env DATABASE_URL is correct
✓ Ensure database name is included in URL
```

### Issue: Image upload fails
```
✓ Check Cloudinary credentials in .env
✓ Verify NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
✓ Check browser console for errors
```

### Issue: Prisma Client errors
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear Turbopack cache
rm -rf node_modules/.cache

# Rebuild
npm run build
```

---

## 📊 Database Management

### View Data (Prisma Studio)
```bash
npm run prisma:studio
```
Opens graphical interface at http://localhost:5555

### Seed Fresh Data
```bash
# Windows
npm run seed:win

# Mac/Linux  
npm run seed
```

### Reset Database (if needed)
```bash
# Warning: This deletes all data!
npx prisma db push --force-reset
npm run seed:win
```

### Backup Database
```bash
# Use MongoDB Atlas backup features
# Or export via Prisma Studio
```

---

## 🔍 Debugging Tips

### View Server Logs
Server logs appear in the terminal where you ran `npm run dev`

### View Browser Console
- Open: Press F12 in your browser
- Check: Console tab for errors
- Check: Network tab for API calls

### Check API Responses
```bash
# Windows PowerShell
Invoke-WebRequest http://localhost:3000/api/health

# Or use browser
# Open: http://localhost:3000/api/health
```

### Enable Verbose Logging
```bash
# Add to .env
DEBUG=*
```

---

## 📱 Mobile Testing

Your app is accessible on your network:

1. Find your local IP: `ipconfig` (shown in terminal)
2. Access from mobile: `http://192.168.1.6:3000`
3. Ensure devices are on same WiFi network

---

## 🎨 Styling & UI

### Technologies Used
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Next.js 16** - React framework with Turbopack

### Modify Styles
- Global styles: `app/globals.css`
- Component styles: Inline Tailwind classes
- Theme colors: Configured in `globals.css`

---

## 🚢 Production Build

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run build
npm start
```

### Check Build Output
- Build output: `.next/` folder
- Optimized pages, API routes, and static assets
- Standalone output for Docker: `.next/standalone/`

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [MongoDB Docs](https://docs.mongodb.com)

### Project Specific Guides
- `AWS_QUICK_START.md` - AWS deployment guide
- `AWS_DEPLOYMENT_GUIDE.md` - Detailed AWS instructions
- `README.md` - Project overview
- `ADMIN_ACCESS_GUIDE.md` - Admin dashboard guide

---

## ✅ Development Checklist

- [x] Dependencies installed
- [x] Environment variables configured
- [x] Database connected
- [x] Database seeded
- [x] Development server running
- [ ] Test all pages
- [ ] Test admin dashboard
- [ ] Test image uploads
- [ ] Test on mobile
- [ ] Ready for development!

---

## 🎉 You're All Set!

Your Al-Khair charity application is running locally and ready for development!

**Main App:** http://localhost:3000
**Admin Dashboard:** http://localhost:3000/admin
**Prisma Studio:** http://localhost:5555 (run `npm run prisma:studio`)

Happy coding! 🚀


