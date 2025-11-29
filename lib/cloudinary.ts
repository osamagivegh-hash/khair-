import { v2 as cloudinary } from 'cloudinary';

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('[Cloudinary Config] Initializing with:', {
  cloudName: cloudName ? `${cloudName.substring(0, 3)}***` : 'MISSING',
  apiKey: apiKey ? `${apiKey.substring(0, 3)}***` : 'MISSING',
  apiSecret: apiSecret ? 'SET' : 'MISSING',
  env: process.env.NODE_ENV,
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('[Cloudinary Config] ERROR: Missing required environment variables!');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

// Only configure if all variables are present
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.error('[Cloudinary Config] CRITICAL: Cannot configure Cloudinary - missing environment variables!');
  console.error('[Cloudinary Config] Required variables:', {
    CLOUDINARY_CLOUD_NAME: cloudName ? 'SET' : 'MISSING',
    CLOUDINARY_API_KEY: apiKey ? 'SET' : 'MISSING',
    CLOUDINARY_API_SECRET: apiSecret ? 'SET' : 'MISSING',
  });
}

export default cloudinary;

export async function uploadImage(file: File | Buffer, folder: string = 'al-khair'): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[Cloudinary Upload] Starting upload to folder:', folder);

      // Validate configuration before attempting upload
      if (!cloudName || !apiKey || !apiSecret) {
        const error = new Error('Cloudinary is not properly configured. Missing environment variables.');
        console.error('[Cloudinary Upload] Configuration error:', error.message);
        reject(error);
        return;
      }

      let buffer: Buffer;

      if (file instanceof File) {
        console.log('[Cloudinary Upload] Converting File to Buffer:', {
          name: file.name,
          type: file.type,
          size: file.size,
        });
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        console.log('[Cloudinary Upload] Using provided Buffer, size:', file.length);
        buffer = file;
      }

      console.log('[Cloudinary Upload] Buffer size:', buffer.length, 'bytes');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ],
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload] Upload failed:', {
              message: error.message,
              name: error.name,
              http_code: (error as any).http_code,
              error: error,
            });
            reject(error);
          } else if (result) {
            console.log('[Cloudinary Upload] Upload successful:', {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
            });
            resolve(result.secure_url);
          } else {
            const err = new Error('Upload failed: No result returned from Cloudinary');
            console.error('[Cloudinary Upload]', err.message);
            reject(err);
          }
        }
      );

      uploadStream.end(buffer);
    } catch (error) {
      console.error('[Cloudinary Upload] Unexpected error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      reject(error);
    }
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

