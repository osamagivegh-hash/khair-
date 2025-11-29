import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all programs
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    // Return empty array instead of error object so frontend doesn't break
    return NextResponse.json([], { status: 200 });
  }
}

// Create a new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, targetAmount, raisedAmount, imageUrl, category } = body;

    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        title,
        description,
        targetAmount: targetAmount || 0,
        raisedAmount: raisedAmount || 0,
        imageUrl,
        category,
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}

