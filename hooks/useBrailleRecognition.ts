import { useState, useCallback, useRef } from 'react';
import { BrailleRecognizer, RecognitionResult } from '@/utils/brailleRecognition';
import { CameraView } from 'expo-camera';
import { Platform } from 'react-native';

export function useBrailleRecognition() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);
  const recognizerRef = useRef<BrailleRecognizer | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const getRecognizer = useCallback(() => {
    if (!recognizerRef.current) {
      recognizerRef.current = new BrailleRecognizer();
    }
    return recognizerRef.current;
  }, []);

  const recognizeFromCamera = useCallback(async (): Promise<RecognitionResult> => {
    if (!cameraRef.current) {
      throw new Error('Camera not available');
    }

    setIsProcessing(true);
    
    try {
      console.log('Taking photo...');
      
      // Capture high-quality photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
        exif: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      console.log('Photo captured, processing...', photo.uri);

      // Process with Braille recognition
      const recognizer = getRecognizer();
      const result = await recognizer.recognizeFromImageUri(photo.uri);
      
      console.log('Recognition completed:', {
        text: result.text,
        cellsFound: result.cells.length,
        confidence: result.confidence,
        processingTime: result.processingTime
      });
      
      setLastResult(result);
      return result;
      
    } catch (error) {
      console.error('Recognition failed:', error);
      
      // For web platform, show a helpful message
      if (Platform.OS === 'web') {
        throw new Error('Camera recognition requires a mobile device. Please test on iOS or Android.');
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [getRecognizer]);

  const setCameraRef = useCallback((ref: CameraView | null) => {
    if (ref) {
      cameraRef.current = ref;
    }
  }, []);

  return {
    recognizeFromCamera,
    setCameraRef,
    isProcessing,
    lastResult,
    cameraRef
  };
}