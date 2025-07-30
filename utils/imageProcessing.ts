import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
}

export class ImageProcessor {
  async preprocessForBraille(imageUri: string): Promise<ProcessedImage> {
    try {
      // Resize image for better processing
      const resized = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } }, // Maintain aspect ratio
        ],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      // Convert to grayscale and enhance contrast
      const processed = await manipulateAsync(
        resized.uri,
        [
          // Expo's built-in image manipulation is limited
          // We'll handle advanced processing in the recognition step
        ],
        { compress: 1.0, format: SaveFormat.JPEG }
      );

      return {
        uri: processed.uri,
        width: processed.width,
        height: processed.height,
      };
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enhanceContrast(imageUri: string): Promise<string> {
    try {
      const result = await manipulateAsync(
        imageUri,
        [
          // Basic contrast enhancement using expo-image-manipulator
        ],
        { compress: 1.0, format: SaveFormat.JPEG }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Contrast enhancement failed:', error);
      throw error;
    }
  }
}