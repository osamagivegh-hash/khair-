# AWS Environment Variables Configuration

## Required Environment Variables

When deploying to AWS, you need to configure the following environment variables:

### 1. Database Configuration

```bash
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/al-khair?retryWrites=true&w=majority"
```

**How to get:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. **Important:** In Network Access, add IP `0.0.0.0/0` to allow AWS to connect

### 2. Cloudinary Configuration

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

**How to get:**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Find your credentials in the dashboard
3. Copy Cloud Name, API Key, and API Secret

---

## How to Set Environment Variables

### AWS Amplify

1. Go to Amplify Console
2. Select your app
3. Go to "Environment variables" in left menu
4. Click "Manage variables"
5. Add each variable:
   - Click "Add variable"
   - Enter key (e.g., `DATABASE_URL`)
   - Enter value
   - Click "Save"

### AWS ECS (Using Secrets Manager)

The automated deployment script handles this, but if doing manually:

```bash
# Create each secret
aws secretsmanager create-secret \
  --name al-khair/DATABASE_URL \
  --secret-string "your_mongodb_connection_string" \
  --region us-east-1

aws secretsmanager create-secret \
  --name al-khair/CLOUDINARY_CLOUD_NAME \
  --secret-string "your_cloudinary_cloud_name" \
  --region us-east-1

aws secretsmanager create-secret \
  --name al-khair/CLOUDINARY_API_KEY \
  --secret-string "your_cloudinary_api_key" \
  --region us-east-1

aws secretsmanager create-secret \
  --name al-khair/CLOUDINARY_API_SECRET \
  --secret-string "your_cloudinary_api_secret" \
  --region us-east-1

aws secretsmanager create-secret \
  --name al-khair/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
  --secret-string "your_cloudinary_cloud_name" \
  --region us-east-1
```

### AWS Elastic Beanstalk

```bash
eb setenv \
  DATABASE_URL="your_mongodb_connection_string" \
  CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name" \
  CLOUDINARY_API_KEY="your_cloudinary_api_key" \
  CLOUDINARY_API_SECRET="your_cloudinary_api_secret" \
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
```

---

## Environment Variable Descriptions

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | Secret | MongoDB connection string for Prisma |
| `CLOUDINARY_CLOUD_NAME` | Secret | Your Cloudinary cloud name for backend uploads |
| `CLOUDINARY_API_KEY` | Secret | Cloudinary API key for authentication |
| `CLOUDINARY_API_SECRET` | Secret | Cloudinary API secret for authentication |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public | Cloudinary cloud name exposed to frontend |

---

## Verification

After setting environment variables, verify they're working:

### Check Application Logs

**Amplify:**
```
Go to Amplify Console → App → Logs
```

**ECS:**
```bash
aws logs tail /ecs/al-khair-prod-app --follow --region us-east-1
```

**Elastic Beanstalk:**
```bash
eb logs
```

### Test Database Connection

Visit: `https://your-app-url/api/health`

Should return: `{"status":"ok"}`

### Test Cloudinary Upload

1. Go to `/admin` page
2. Try uploading an image
3. Check if it uploads successfully

---

## Security Best Practices

✅ **DO:**
- Use AWS Secrets Manager for ECS deployments
- Rotate secrets regularly
- Use IAM roles with least privilege
- Keep secrets out of version control

❌ **DON'T:**
- Commit secrets to Git
- Share secrets in plain text
- Use the same credentials for dev and prod
- Store secrets in code

---

## Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to MongoDB

**Solutions:**
1. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
2. Verify connection string is correct (no spaces)
3. Ensure password doesn't contain special characters that need encoding
4. Test connection string locally first

### Cloudinary Upload Issues

**Problem:** Image uploads fail

**Solutions:**
1. Verify all Cloudinary variables are set correctly
2. Check API key and secret are correct
3. Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` matches `CLOUDINARY_CLOUD_NAME`
4. Check Cloudinary CORS settings allow your domain

### Environment Variables Not Loading

**Problem:** App can't read environment variables

**Solutions:**
1. Restart the service/app after setting variables
2. Check variable names match exactly (case-sensitive)
3. For Amplify: redeploy after setting variables
4. For ECS: force new deployment
5. Check CloudWatch logs for specific error messages

---

## Additional Resources

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

Need help? Refer to `AWS_DEPLOYMENT_GUIDE.md` for complete deployment instructions.


