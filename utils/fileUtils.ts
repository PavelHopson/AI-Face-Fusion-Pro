
import type { ImageFile } from '../types';

/**
 * Converts a File object to a base64 string and extracts its MIME type and dimensions.
 * @param file The File object to convert.
 * @returns A promise that resolves to an ImageFile object.
 */
export const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error("Failed to read file"));
        return;
      }
      
      const parts = result.split(';base64,');
      if (parts.length !== 2) {
        return reject(new Error("Invalid data URL format"));
      }
      const mimeType = parts[0].split(':')[1];
      const data = parts[1];

      const img = new Image();
      img.onload = () => {
        resolve({ 
            data, 
            mimeType, 
            width: img.width, 
            height: img.height 
        });
      };
      img.onerror = () => reject(new Error("Failed to load image for dimensions"));
      img.src = result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
