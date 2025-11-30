import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD REQUEST STARTED ===');

    // Check configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Config check:', {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      cloudName: cloudName ? `${cloudName.substring(0, 3)}***` : 'MISSING',
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('ERROR: Missing Cloudinary credentials');
      const response = NextResponse.json(
        {
          success: false,
          error: 'Cloudinary not configured. Missing environment variables.',
          missing: {
            cloudName: !cloudName,
            apiKey: !apiKey,
            apiSecret: !apiSecret,
          }
        },
        { status: 500 }
      );
      return setCorsHeaders(response);
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'al-khair';

    console.log('File info:', {
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
      return setCorsHeaders(response);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid file type. Only images allowed.' },
        { status: 400 }
      );
      return setCorsHeaders(response);
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const response = NextResponse.json(
        { success: false, error: 'File too large. Max 10MB.' },
        { status: 400 }
      );
      return setCorsHeaders(response);
    }

    console.log('Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created, size:', buffer.length);

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload...');
    const uploadResult = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            console.log('Upload successful:', result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log('=== UPLOAD SUCCESS ===');
    const response = NextResponse.json({
      success: true,
      url: uploadResult,
    });
    return setCorsHeaders(response);

  } catch (error: any) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error details:', error);
    console.error('Error stack:', error?.stack);
    console.error('===================');

    const response = NextResponse.json(
      {
        success: false,
        error: error?.message || 'Upload failed',
        errorType: error?.constructor?.name,
        errorDetails: {
          message: error?.message,
          http_code: error?.http_code,
          name: error?.name,
        }
      },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}
