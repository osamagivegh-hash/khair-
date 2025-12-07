import { NextResponse } from 'next/server';

/**
 * This endpoint has been disabled in production for security reasons.
 * It was uploading test files to Cloudinary which could exhaust API quotas.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'This debug endpoint has been disabled for security reasons.',
      suggestion: 'Use /api/health to check service status, or /api/upload for actual uploads.',
    },
    { status: 403 }
  );
}
