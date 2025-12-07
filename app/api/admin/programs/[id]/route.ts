import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Get single program (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
  }
}

// Update program (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, targetAmount, raisedAmount, imageUrl, category } = body;

    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(title && { title: String(title).slice(0, 200) }),
        ...(description && { description: String(description).slice(0, 2000) }),
        ...(targetAmount !== undefined && { targetAmount: Math.max(0, Number(targetAmount)) }),
        ...(raisedAmount !== undefined && { raisedAmount: Math.max(0, Number(raisedAmount)) }),
        ...(imageUrl && { imageUrl: String(imageUrl).slice(0, 1000) }),
        ...(category && { category: String(category).slice(0, 100) }),
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
  }
}

// Delete program (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
  }
}
