import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Get all news (public - for frontend)
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Create a new news item (protected - admin only)
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, content, isBreaking } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title: String(title).slice(0, 200),
        content: String(content).slice(0, 5000),
        isBreaking: Boolean(isBreaking),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}
