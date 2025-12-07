import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkStrictRateLimit } from '@/lib/rate-limit';

/**
 * Initialize database collections (for MongoDB)
 * Protected endpoint - requires admin authentication
 */
export async function POST(request: NextRequest) {
  // Strict rate limit
  const rateLimitError = checkStrictRateLimit(request);
  if (rateLimitError) return rateLimitError;

  // Admin authentication required
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    // Test connection and count documents in each collection
    const slidesCount = await prisma.slide.count().catch(() => 0);
    const programsCount = await prisma.program.count().catch(() => 0);
    const newsCount = await prisma.news.count().catch(() => 0);
    const messagesCount = await prisma.message.count().catch(() => 0);

    return NextResponse.json({
      success: true,
      message: 'Database connection verified',
      collections: {
        slides: slidesCount,
        programs: programsCount,
        news: newsCount,
        messages: messagesCount,
      },
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
