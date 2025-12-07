import { NextResponse } from 'next/server';

/**
 * This endpoint has been disabled in production for security reasons.
 * It was exposing environment variable information.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'This debug endpoint has been disabled for security reasons.',
      suggestion: 'Check Cloud Run console for environment configuration.',
    },
    { status: 403 }
  );
}
