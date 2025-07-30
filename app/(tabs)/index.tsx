import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { speak } from 'expo-speech';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useBrailleRecognition } from '../../hooks/useBrailleRecognition';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { isProcessing, lastResult, debugInfo, recognizeFromCamera, getRecognizerStatus } = useBrailleRecognition();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await getRecognizerStatus();
      setApiStatus(status);
    } catch (error) {
      setApiStatus('Error checking status');
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not available');
      return;
    }

    try {
      // Haptic feedback - always try on mobile
      try {
        impactAsync(ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Ignore haptic errors on unsupported platforms
      }

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
      
      // Process with AI recognition
      const result = await recognizeFromCamera(photo.uri);
      
      // Debug logging (instead of UI overlay)
      if (__DEV__ && debugInfo) {
        console.log('=== DEBUG INFO ===');
        console.log(debugInfo);
        console.log('==================');
      }
      
      // Speak the result if text was found
      if (result.text && result.confidence > 0.3) {
        speak(result.text, {
          language: 'en',
          rate: 0.8,
          pitch: 1.0,
        });
      }
    } catch (error) {
      console.error('Capture failed:', error);
      Alert.alert('Error', 'Failed to capture or process image. Please try again.');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to scan Braille text. Please grant permission to continue.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          flash="off"
        />
        
        {/* Overlay with scanning frame */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanFrame}>
              <View style={styles.frameCorner} />
              <View style={[styles.frameCorner, styles.topRight]} />
              <View style={[styles.frameCorner, styles.bottomLeft]} />
              <View style={[styles.frameCorner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>AI Braille Scanner</Text>
          <Text style={styles.instructionsText}>
            Point camera at BRAILLE DOT PATTERNS
          </Text>
          <Text style={styles.instructionsSubText}>
            • Works with raised OR printed Braille
            • Focus on dot patterns, not regular text
            • Ensure good lighting and steady aim
          </Text>
          <Text style={styles.statusText}>{apiStatus}</Text>
        </View>

        {/* Capture Button */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            <Text style={styles.captureButtonText}>
              {isProcessing ? 'Processing...' : 'Capture & Analyze'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Display */}
        {lastResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultText}>{lastResult.text}</Text>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(lastResult.confidence * 100)}%
            </Text>
            {lastResult.brailleText && (
              <Text style={styles.brailleText}>{lastResult.brailleText}</Text>
            )}
          </View>
        )}

        {/* Debug Info - Removed overlay, check console logs instead */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.2,
    backgroundColor: 'transparent',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: height * 0.6,
    backgroundColor: 'transparent',
  },
  sideOverlay: {
    width: width * 0.05,
    height: '100%',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: width * 0.7,
    height: height * 0.4,
    borderWidth: 3,
    borderColor: '#3B82F6',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  frameCorner: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.2,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    position: 'absolute',
    top: height * 0.6,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionsSubText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  captureButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    position: 'absolute',
    top: height * 0.6,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  brailleText: {
    fontSize: 18,
    color: '#E5E7EB',
    fontFamily: 'monospace',
    marginTop: 10,
  },

});