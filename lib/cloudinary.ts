import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function uploadImage(file: File | Buffer, folder: string = 'al-khair'): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('[Cloudinary] Starting upload to folder:', folder);

      let buffer: Buffer;

      if (file instanceof File) {
        console.log('[Cloudinary] Converting File to Buffer');
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      console.log('[Cloudinary] Buffer size:', buffer.length, 'bytes');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload failed:', error);
            reject(error);
          } else if (result) {
            console.log('[Cloudinary] Upload successful:', result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      );

      uploadStream.end(buffer);
    } catch (error) {
      console.error('[Cloudinary] Error:', error);
      reject(error);
    }
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: any) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
