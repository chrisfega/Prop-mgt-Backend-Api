import ImageKit from 'imagekit';
import { env } from '../config/env';

let imagekitInstance: ImageKit | null = null;

// Lazy initialize ImageKit only when needed
const getImageKit = () => {
  if (!imagekitInstance) {
    if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
      throw new Error('ImageKit credentials are not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in your .env file.');
    }
    
    imagekitInstance = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekitInstance;
};

export const uploadToImageKit = async (file: Express.Multer.File, folder: string = 'properties') => {
  try {
    const imagekit = getImageKit();
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: folder,
    });
    return result.url;
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    // Return the actual error message from ImageKit
    const errorMessage = error?.message || 'Failed to upload image';
    throw new Error(`ImageKit upload failed: ${errorMessage}`);
  }
};

export default getImageKit;
