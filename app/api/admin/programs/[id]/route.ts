import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, targetAmount, raisedAmount, imageUrl, category } = body;

    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(raisedAmount !== undefined && { raisedAmount }),
        ...(imageUrl && { imageUrl }),
        ...(category && { category }),
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// Delete a program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}

