import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { speak } from 'expo-speech';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, Mic, MicOff, RefreshCw } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useBrailleRecognition } from '@/hooks/useBrailleRecognition';

const { height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scannedText, setScannedText] = useState('');
  const [scannedBraille, setScannedBraille] = useState('');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [confidence, setConfidence] = useState(0);
  
  const { recognizeFromCamera, setCameraRef, isProcessing, cameraRef } = useBrailleRecognition();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const speechSetting = await AsyncStorage.getItem('speechEnabled');
      if (speechSetting !== null) {
        setIsSpeechEnabled(JSON.parse(speechSetting));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveScanToHistory = async (brailleText: string, englishText: string) => {
    try {
      const existingHistory = await AsyncStorage.getItem('scanHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newScan = {
        id: Date.now().toString(),
        brailleText,
        englishText,
        timestamp: new Date().toISOString(),
      };
      
      history.unshift(newScan);
      
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem('scanHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving scan to history:', error);
    }
  };

  const performScan = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      // Perform actual Braille recognition from camera
      const result = await recognizeFromCamera();
      
      setScannedText(result.text);
      setScannedBraille(result.brailleText);
      setConfidence(result.confidence);
      setLastScanTime(new Date());
      
      // Save to history
      await saveScanToHistory(result.brailleText, result.text);
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        impactAsync(ImpactFeedbackStyle.Medium);
      }
      
      // Speak the result if enabled
      if (isSpeechEnabled && result.text !== 'No text recognized') {
        speak(`Scanned: ${result.text}`, {
          language: 'en',
          pitch: 1,
          rate: 0.8,
        });
      }
      
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Scan Failed', (error as Error).message);
    }
  };

  const speakText = () => {
    if (scannedText && scannedText !== 'No text recognized') {
      speak(scannedText, {
        language: 'en',
        pitch: 1,
        rate: 0.8,
      });
    }
  };

  const toggleSpeech = async () => {
    const newSpeechState = !isSpeechEnabled;
    setIsSpeechEnabled(newSpeechState);
    
    try {
      await AsyncStorage.setItem('speechEnabled', JSON.stringify(newSpeechState));
    } catch (error) {
      console.error('Error saving speech setting:', error);
    }
    
    speak(newSpeechState ? 'Speech enabled' : 'Speech disabled', {
      language: 'en',
      pitch: 1,
      rate: 0.8,
    });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#6B7280" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan Braille characters
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
      <View style={styles.header}>
        <Text style={styles.title}>Braille Scanner</Text>
        <TouchableOpacity
          style={[styles.speechButton, !isSpeechEnabled && styles.speechButtonDisabled]}
          onPress={toggleSpeech}
        >
          {isSpeechEnabled ? (
            <Mic size={24} color="#FFFFFF" />
          ) : (
            <MicOff size={24} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing={facing}
          ref={setCameraRef}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.instructionText}>
            Position Braille text within the frame and tap scan
          </Text>
        </View>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Recognized Text:</Text>
        <View style={styles.textContainer}>
          <Text style={styles.resultText}>
            {scannedText || 'No text scanned yet'}
          </Text>
          {scannedText && scannedText !== 'No text recognized' && (
            <TouchableOpacity style={styles.speakButton} onPress={speakText}>
              <Mic size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
        
        {scannedBraille && (
          <View style={styles.brailleContainer}>
            <Text style={styles.brailleLabel}>Braille:</Text>
            <Text style={styles.brailleText}>{scannedBraille}</Text>
          </View>
        )}{confidence > 0 && (
          <Text style={styles.confidence}>
            Confidence: {Math.round(confidence * 100)}%
          </Text>
        )}{lastScanTime && (
          <Text style={styles.timestamp}>
            Last scan: {lastScanTime.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.scanButton, isProcessing && styles.scanButtonDisabled]}
          onPress={performScan}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <RefreshCw size={24} color="#FFFFFF" />
          ) : (
            <Camera size={24} color="#FFFFFF" />
          )}
          <Text style={styles.scanButtonText}>
            {isProcessing ? 'Processing...' : 'Scan Braille'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  speechButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechButtonDisabled: {
    backgroundColor: '#374151',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: '#3B82F6',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resultContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 26,
  },
  speakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  brailleContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  brailleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  brailleText: {
    fontSize: 20,
    color: '#E5E7EB',
    fontFamily: 'monospace',
    lineHeight: 28,
  },
  confidence: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});