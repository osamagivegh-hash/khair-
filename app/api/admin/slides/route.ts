import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Get all slides (public - for frontend)
export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const slides = await prisma.slide.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Create a new slide (protected - admin only)
export async function POST(request: NextRequest) {
  // Rate limit check
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  // Admin authentication required
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, subtitle, imageUrl, order } = body;

    if (!title || !subtitle || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, subtitle, imageUrl' },
        { status: 400 }
      );
    }

    const slide = await prisma.slide.create({
      data: {
        title: String(title).slice(0, 200),
        subtitle: String(subtitle).slice(0, 500),
        imageUrl: String(imageUrl).slice(0, 1000),
        order: order ? parseInt(String(order)) : 0,
      },
    });

    return NextResponse.json(slide);
  } catch (error: unknown) {
    console.error('Error creating slide:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create slide', details: message },
      { status: 500 }
    );
  }
}
