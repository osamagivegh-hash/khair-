import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Get all programs (public - for frontend)
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Create a new program (protected - admin only)
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, description, targetAmount, raisedAmount, imageUrl, category } = body;

    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, imageUrl, category' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        title: String(title).slice(0, 200),
        description: String(description).slice(0, 2000),
        targetAmount: Math.max(0, Number(targetAmount) || 0),
        raisedAmount: Math.max(0, Number(raisedAmount) || 0),
        imageUrl: String(imageUrl).slice(0, 1000),
        category: String(category).slice(0, 100),
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}
