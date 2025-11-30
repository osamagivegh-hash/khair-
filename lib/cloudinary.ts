// Import cloudinary from upload-config
import { cloudinary, isCloudinaryConfigured } from './upload-config';

// Re-export for backward compatibility
export { cloudinary as default, isCloudinaryConfigured };

export async function uploadImage(file: File | Buffer, folder: string = 'al-khair'): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Import upload config
      const { cloudinary, isCloudinaryConfigured, cloudinaryFolder: defaultFolder } = await import('./upload-config');
      
      // Use provided folder or default
      const uploadFolder = folder || defaultFolder;

      console.log('[Cloudinary Upload] Starting upload to folder:', uploadFolder);
      console.log('[Cloudinary Upload] Cloudinary configured:', isCloudinaryConfigured);

      // Validate configuration before attempting upload
      if (!isCloudinaryConfigured) {
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
          folder: uploadFolder,
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

