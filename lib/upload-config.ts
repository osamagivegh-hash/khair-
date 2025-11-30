import { v2 as cloudinary } from 'cloudinary';

/**
 * Helper function to trim environment variables
 */
const trimEnv = (v: string | undefined): string | undefined => {
  return typeof v === 'string' ? v.trim() : undefined;
};

/**
 * Read and clean environment variables
 */
const cloudinaryCloudName = trimEnv(process.env.CLOUDINARY_CLOUD_NAME);
const cloudinaryApiKey = trimEnv(process.env.CLOUDINARY_API_KEY);
const cloudinaryApiSecret = trimEnv(process.env.CLOUDINARY_API_SECRET);
const useCloudinaryEnv = trimEnv(process.env.USE_CLOUDINARY);
const cloudinaryFolder = trimEnv(process.env.CLOUDINARY_FOLDER) || 'al-khair';

/**
 * Check if Cloudinary is configured (runtime check)
 * This function checks environment variables at runtime, not at module load time
 */
export function checkCloudinaryConfig(): boolean {
  const currentCloudName = trimEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const currentApiKey = trimEnv(process.env.CLOUDINARY_API_KEY);
  const currentApiSecret = trimEnv(process.env.CLOUDINARY_API_SECRET);
  const currentUseCloudinary = trimEnv(process.env.USE_CLOUDINARY);
  
  const hasCredentials = !!currentCloudName && !!currentApiKey && !!currentApiSecret;
  const isEnabled = currentUseCloudinary !== 'false';
  
  return hasCredentials && isEnabled;
}

/**
 * Check if Cloudinary is configured (module load time - for initial config)
 */
const hasCloudinaryCredentials = !!cloudinaryCloudName && !!cloudinaryApiKey && !!cloudinaryApiSecret;
const missingCloudinaryVars = [
  !cloudinaryCloudName && 'CLOUDINARY_CLOUD_NAME',
  !cloudinaryApiKey && 'CLOUDINARY_API_KEY',
  !cloudinaryApiSecret && 'CLOUDINARY_API_SECRET',
].filter(Boolean) as string[];

const isCloudinaryConfigured =
  hasCloudinaryCredentials &&
  useCloudinaryEnv !== 'false';

/**
 * Configure Cloudinary if available
 */
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });

  const isRuntime = typeof window === 'undefined' && process.env.NODE_ENV !== undefined;
  
  if (isRuntime) {
    console.log('✅ Cloudinary storage configured');
    console.log('Cloudinary settings:', {
      cloud_name: cloudinaryCloudName,
      api_key_loaded: !!cloudinaryApiKey,
      folder: cloudinaryFolder,
    });
  }
} else {
  const isRuntime = typeof window === 'undefined' && process.env.NODE_ENV !== undefined;
  
  if (isRuntime) {
    console.log('⚠️ Cloudinary disabled — using local uploads');
    if (!hasCloudinaryCredentials) {
      console.log('Reason: missing Cloudinary environment variables (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).');
    } else if (useCloudinaryEnv === 'false') {
      console.log('Reason: USE_CLOUDINARY is explicitly set to "false".');
    } else {
      console.log('Reason: Cloudinary credentials missing or not fully defined.');
    }
  }
}

/**
 * Upload configuration
 */
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '') || 10 * 1024 * 1024; // 10MB default
const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || 
  ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validate file type
 */
export function isValidFileType(mimetype: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimetype);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Export everything needed
 */
export {
  cloudinary,
  isCloudinaryConfigured,
  cloudinaryFolder,
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
  hasCloudinaryCredentials,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  checkCloudinaryConfig,
  missingCloudinaryVars,
};

export const cloudinaryConfig = isCloudinaryConfigured ? {
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
} : null;

