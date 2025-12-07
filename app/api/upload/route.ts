import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { checkRateLimit } from '@/lib/rate-limit';

// Force dynamic to prevent static optimization issues
export const dynamic = 'force-dynamic';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  // Rate limit check (standard - 60 requests per minute)
  const rateLimitError = checkRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    // 1. Configure Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials');
      return NextResponse.json({
        success: false,
        error: 'Server misconfiguration: Missing Cloudinary credentials',
      }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // 2. Parse Form Data safely
    let formData;
    try {
      formData = await request.formData();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('Failed to parse form data:', message);
      return NextResponse.json({
        success: false,
        error: 'Failed to read file upload. Please try again.',
        details: message
      }, { status: 400 });
    }

    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'al-khair';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 3. Validate file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    // 4. Convert File to Buffer safely
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('Failed to convert file to buffer:', message);
      return NextResponse.json({
        success: false,
        error: 'Failed to process file data.',
        details: message
      }, { status: 500 });
    }

    // 5. Upload to Cloudinary (Using Base64)
    const base64Data = buffer.toString('base64');
    const fileType = file.type || 'application/octet-stream';
    const dataURI = `data:${fileType};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      // Limit transformations to prevent abuse
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }
      ]
    });

    console.log('Upload successful:', result.secure_url);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : 'UnknownError';
    console.error('Upload error:', message);

    return NextResponse.json({
      success: false,
      error: 'Upload failed due to server error',
      message: message,
      type: name
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
