import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrailleRecognizer, RecognitionResult } from '../utils/brailleRecognition';

export const useBrailleRecognition = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const recognizerRef = useRef<BrailleRecognizer | null>(null);

  // Initialize recognizer with saved API key
  const initializeRecognizer = async () => {
    if (!recognizerRef.current) {
      recognizerRef.current = new BrailleRecognizer();
      
      // Try to load saved API key
      try {
        const savedApiKey = await AsyncStorage.getItem('openrouterApiKey');
        if (savedApiKey) {
          recognizerRef.current.setOpenRouterApiKey(savedApiKey);
          console.log('Loaded saved OpenRouter API key');
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    }
    return recognizerRef.current;
  };

  const recognizeFromCamera = async (imageUri: string) => {
    setIsProcessing(true);
    setDebugInfo('Initializing recognition...');
    
    try {
      const recognizer = await initializeRecognizer();
      
      // Check if API is configured
      const status = recognizer.getStatus();
      setDebugInfo(status);
      
      const result = await recognizer.recognizeFromImageUri(imageUri);
      setLastResult(result);
      
      // Update debug info with processing details
      if (result.debugInfo) {
        const debugText = [
          `Status: ${status}`,
          `Processing time: ${result.processingTime}ms`,
          `Image: ${result.debugInfo.imageSize.width}x${result.debugInfo.imageSize.height}`,
          `Confidence: ${Math.round(result.confidence * 100)}%`,
          `Steps: ${result.debugInfo.processingSteps.length}`,
          ...result.debugInfo.processingSteps.slice(-3) // Last 3 steps
        ].join('\n');
        setDebugInfo(debugText);
      }
      
      // Save to history
      await saveToHistory(result);
      
      return result;
    } catch (error) {
      console.error('Recognition error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(`Error: ${errorMessage}`);
      
      // Return error result
      const errorResult: RecognitionResult = {
        text: `Recognition failed: ${errorMessage}`,
        brailleText: '',
        confidence: 0,
        cells: [],
        processingTime: 0,
        debugInfo: {
          imageSize: { width: 0, height: 0 },
          dotsDetected: 0,
          cellsDetected: 0,
          processingSteps: [`Error: ${errorMessage}`]
        }
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToHistory = async (result: RecognitionResult) => {
    try {
      const historyKey = 'brailleHistory';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        text: result.text,
        brailleText: result.brailleText,
        confidence: result.confidence,
        processingTime: result.processingTime,
      };
      
      history.unshift(historyItem); // Add to beginning
      
      // Keep only last 100 items
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const getRecognizerStatus = async (): Promise<string> => {
    const recognizer = await initializeRecognizer();
    return recognizer.getStatus();
  };

  return {
    isProcessing,
    lastResult,
    debugInfo,
    recognizeFromCamera,
    getRecognizerStatus,
  };
};