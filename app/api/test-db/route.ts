import { NextResponse } from 'next/server';

/**
 * This endpoint has been disabled in production for security reasons.
 * It was creating and deleting database records which could be abused.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'This debug endpoint has been disabled for security reasons.',
      suggestion: 'Use /api/health to check service status.',
    },
    { status: 403 }
  );
}
