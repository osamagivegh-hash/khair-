import { NextResponse } from 'next/server';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';

/**
 * Test endpoint to verify Cloudinary connection and credentials
 */
export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if variables are set
    if (!isCloudinaryConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        variables: {
          CLOUDINARY_CLOUD_NAME: !!cloudName,
          CLOUDINARY_API_KEY: !!apiKey,
          CLOUDINARY_API_SECRET: !!apiSecret,
        },
      }, { status: 500 });
    }

    // Test Cloudinary connection by getting account details
    try {
      const result = await cloudinary.api.ping();
      return NextResponse.json({
        success: true,
        message: 'Cloudinary connection successful',
        cloudinary: {
          cloudName: cloudName,
          apiKey: apiKey ? apiKey.substring(0, 3) + '***' : 'MISSING',
          status: result.status === 'ok' ? 'Connected' : 'Unknown',
        },
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary connection failed',
        message: error.message || String(error),
        httpCode: error.http_code,
        name: error.name,
        details: {
          cloudName,
          apiKey: apiKey ? apiKey.substring(0, 3) + '***' : 'MISSING',
          hasApiSecret: !!apiSecret,
        },
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}



