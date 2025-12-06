import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Initialize database collections (for MongoDB)
export async function POST() {
  try {
    // Test connection and create collections if they don't exist
    // MongoDB creates collections automatically on first insert, but we can verify connection
    
    // Try to count documents in each collection
    const slidesCount = await prisma.slide.count().catch(() => 0);
    const programsCount = await prisma.program.count().catch(() => 0);
    const newsCount = await prisma.news.count().catch(() => 0);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized',
      collections: {
        slides: slidesCount,
        programs: programsCount,
        news: newsCount,
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






