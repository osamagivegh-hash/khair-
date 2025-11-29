import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to check if Cloudinary environment variables are set
 * This helps debug upload issues
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const allSet = !!(cloudName && apiKey && apiSecret);

  return NextResponse.json({
    cloudinary: {
      configured: allSet,
      variables: {
        CLOUDINARY_CLOUD_NAME: cloudName ? `${cloudName.substring(0, 3)}***` : 'MISSING',
        CLOUDINARY_API_KEY: apiKey ? `${apiKey.substring(0, 3)}***` : 'MISSING',
        CLOUDINARY_API_SECRET: apiSecret ? 'SET' : 'MISSING',
      },
      status: allSet ? '✅ Configured' : '❌ Missing variables',
    },
    database: {
      configured: !!process.env.DATABASE_URL,
      status: process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing',
    },
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
}

