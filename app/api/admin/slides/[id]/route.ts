import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// Get single slide (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const slide = await prisma.slide.findUnique({
      where: { id },
    });

    if (!slide) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error fetching slide:', error);
    return NextResponse.json({ error: 'Failed to fetch slide' }, { status: 500 });
  }
}

// Update slide (protected)
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
    const { title, subtitle, imageUrl, order } = body;

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        ...(title && { title: String(title).slice(0, 200) }),
        ...(subtitle && { subtitle: String(subtitle).slice(0, 500) }),
        ...(imageUrl && { imageUrl: String(imageUrl).slice(0, 1000) }),
        ...(order !== undefined && { order: parseInt(String(order)) }),
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

// Delete slide (protected)
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
    await prisma.slide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
