import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Health check endpoint for Cloud Run and monitoring
 * Returns service status without exposing sensitive information
 */
export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const startTime = Date.now();

  try {
    // Test database connection with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      latency: {
        db: `${dbLatency}ms`,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        // Don't expose error details in production
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
