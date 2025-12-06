# MongoDB Atlas Configuration

Your application is now configured to use MongoDB Atlas instead of SQLite.

## Connection String

```
mongodb+srv://osamashaer66_db_user:990099@mawaddah.lh79hv8.mongodb.net/?appName=Mawaddah
```

## Important: Network Access Configuration

**You MUST configure MongoDB Atlas Network Access to allow Cloud Run connections:**

### Step 1: Add Cloud Run IP to Whitelist

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to **Network Access** (under Security)
3. Click **Add IP Address**
4. For Cloud Run, you have two options:

   **Option A: Allow All IPs (Easier, but less secure)**
   - Add: `0.0.0.0/0`
   - This allows connections from anywhere
   - ⚠️ Less secure, but works immediately

   **Option B: Allow Specific Cloud Run IPs (More secure)**
   - Cloud Run IPs are dynamic, so this is harder
   - You may need to check Cloud Run logs to see the IP
   - Or use VPC connector for static IPs

### Step 2: Verify Database User

Make sure the database user has proper permissions:
- Username: `osamashaer66_db_user`
- Password: `990099`
- Database: (default or specified in connection string)

## Database Schema

The Prisma schema has been updated for MongoDB:
- All IDs are now `String` (MongoDB ObjectId)
- No migrations needed - MongoDB creates collections automatically
- Use `prisma db push` instead of `prisma migrate deploy`

## Deployment

The connection string is automatically set in:
- `cloudbuild.yaml`
- `deploy.sh`
- Dockerfile (via environment variable)

## Testing Connection

After deployment, test the connection:

```bash
# Health check (tests database connection)
curl https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/health
```

## Seeding Database

After deployment, seed the database:

```bash
curl -X POST https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/seed
```

## Changes Made

1. ✅ Updated `prisma/schema.prisma` - Changed to MongoDB provider
2. ✅ Updated all model IDs from `Int` to `String @id @default(auto())`
3. ✅ Updated `Dockerfile` - Removed SQLite, updated CMD to use `db push`
4. ✅ Updated `cloudbuild.yaml` - MongoDB connection string
5. ✅ Updated `deploy.sh` - MongoDB connection string
6. ✅ Updated `env.example` - MongoDB connection string

## Troubleshooting

### Connection Refused
- Check MongoDB Atlas Network Access whitelist
- Verify username/password are correct
- Check if database cluster is running

### Authentication Failed
- Verify database user credentials
- Check user permissions in MongoDB Atlas

### Timeout Errors
- Ensure `0.0.0.0/0` is in Network Access whitelist
- Check MongoDB Atlas cluster status

---

**Next Step:** Configure Network Access in MongoDB Atlas, then redeploy!






