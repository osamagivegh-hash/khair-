import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary config check:', {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary configuration');
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary configuration is missing. Please check environment variables.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'al-khair';

    console.log('Upload request:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      folder,
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log('Starting upload to Cloudinary...');
    const imageUrl = await uploadImage(file, folder);
    console.log('Upload successful:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Log all error properties
    if (error && typeof error === 'object') {
      console.error('All error properties:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }

    console.error('Full error object:', error);
    console.error('===================');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        details: process.env.NODE_ENV === 'development' ? {
          type: error?.constructor?.name,
          stack: error instanceof Error ? error.stack : undefined,
        } : undefined,
      },
      { status: 500 }
    );
  }
}




