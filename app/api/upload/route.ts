import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { isCloudinaryConfigured, isValidFileType, isValidFileSize, cloudinaryFolder, MAX_FILE_SIZE, missingCloudinaryVars } from '@/lib/upload-config';
import { handleOptions, withCors } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration at runtime (not module load time)
    const { checkCloudinaryConfig } = await import('@/lib/upload-config');
    const isConfigured = checkCloudinaryConfig();
    
    if (!isConfigured) {
      console.error('Missing Cloudinary configuration at runtime');
      console.error('Environment check:', {
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        USE_CLOUDINARY: process.env.USE_CLOUDINARY,
      });
      const response = NextResponse.json(
        {
          success: false,
          error: 'Cloudinary environment variables are missing on the server.',
          missingVariables: missingCloudinaryVars,
          resolution: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Cloud Run environment variables, then redeploy.',
        },
        { status: 503 }
      );
      return withCors(response, request);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || cloudinaryFolder;

    console.log('Upload request:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      folder,
    });

    if (!file) {
      const response = NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
      return withCors(response, request);
    }

    // Validate file type
    if (!isValidFileType(file.type)) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
      return withCors(response, request);
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
      const response = NextResponse.json(
        { success: false, error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      );
      return withCors(response, request);
    }

    console.log('Starting upload to Cloudinary...');
    const imageUrl = await uploadImage(file, folder);
    console.log('Upload successful:', imageUrl);

    const response = NextResponse.json({
      success: true,
      url: imageUrl,
    });

    return withCors(response, request);
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

    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        errorType: error?.constructor?.name,
        // Include more details to help debug
        details: {
          message: error instanceof Error ? error.message : String(error),
          type: error?.constructor?.name,
          // Include stack trace in production for debugging (remove later if needed)
          stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
          // Include any additional error properties
          ...(error && typeof error === 'object' ? error : {}),
        },
      },
      { status: 500 }
    );

    return withCors(response, request);
  }
}




