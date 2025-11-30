import { NextRequest, NextResponse } from 'next/server';
import { missingCloudinaryVars } from '@/lib/upload-config';

export async function GET(request: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  const hasCloudName = !!cloudName;
  const hasApiKey = !!apiKey;
  const hasApiSecret = !!apiSecret;
  const hasDatabase = !!databaseUrl;

  const isCloudinaryConfigured = hasCloudName && hasApiKey && hasApiSecret;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    cloudinary: {
      configured: isCloudinaryConfigured,
      variables: {
        CLOUDINARY_CLOUD_NAME: hasCloudName ? `${cloudName?.substring(0, 3)}***` : 'MISSING',
        CLOUDINARY_API_KEY: hasApiKey ? `${apiKey?.substring(0, 3)}***` : 'MISSING',
        CLOUDINARY_API_SECRET: hasApiSecret ? 'SET' : 'MISSING',
      },
      status: isCloudinaryConfigured ? '✅ Configured' : '❌ Not Configured',
      missing: missingCloudinaryVars,
      resolution: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the Cloud Run environment before redeploying.',
    },
    database: {
      configured: hasDatabase,
      status: hasDatabase ? '✅ Configured' : '❌ Not Configured',
    },
    message: isCloudinaryConfigured
      ? 'All Cloudinary environment variables are set correctly!'
      : 'ERROR: Cloudinary environment variables are missing! Please set them in Cloud Run.',
  });
}
