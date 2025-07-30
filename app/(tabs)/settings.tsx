import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Volume2, Bell, Zap, Info, Eye, Save } from 'lucide-react-native';
import { BrailleRecognizer } from '../../utils/brailleRecognition';

export default function SettingsScreen() {
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [vibrationsEnabled, setVibrationsEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [recognizer] = useState(() => new BrailleRecognizer());
  const [apiStatus, setApiStatus] = useState('Not configured');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSpeech = await AsyncStorage.getItem('speechEnabled');
      const savedVibrations = await AsyncStorage.getItem('vibrationsEnabled');
      const savedDebug = await AsyncStorage.getItem('debugMode');
      const savedApiKey = await AsyncStorage.getItem('openrouterApiKey');

      if (savedSpeech !== null) setSpeechEnabled(JSON.parse(savedSpeech));
      if (savedVibrations !== null) setVibrationsEnabled(JSON.parse(savedVibrations));
      if (savedDebug !== null) setDebugMode(JSON.parse(savedDebug));
      if (savedApiKey !== null) {
        setApiKey(savedApiKey);
        const success = recognizer.setOpenRouterApiKey(savedApiKey);
        if (success) {
          setApiStatus('✅ Connected to OpenRouter Gemini 2.5 Flash Lite');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      const success = recognizer.setOpenRouterApiKey(apiKey.trim());
      if (success) {
        await AsyncStorage.setItem('openrouterApiKey', apiKey.trim());
        setApiStatus('✅ Connected to OpenRouter Gemini 2.5 Flash Lite');
        Alert.alert('Success!', 'OpenRouter API key configured successfully. You can now use real AI recognition!');
      } else {
        Alert.alert('Error', 'Failed to configure API key. Please check the key and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const getApiKey = () => {
    Alert.alert(
      'Get OpenRouter API Key',
      'To use real AI Braille recognition:\n\n1. Go to openrouter.ai\n2. Sign up for free\n3. Get an API key\n4. Paste it below\n\nOpenRouter gives you access to Gemini 2.5 Flash Lite at $0.10/M input tokens!',
      [
        { text: 'OK' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* AI Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>AI Configuration</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>OpenRouter API Key</Text>
            <Text style={styles.settingDescription}>
              Use real Gemini 2.5 Flash Lite AI for accurate Braille recognition
            </Text>
            <Text style={styles.statusText}>{apiStatus}</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={saveApiKey}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Save Key</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={getApiKey}
              >
                <Text style={styles.secondaryButtonText}>Get API Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Audio</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Text-to-Speech</Text>
              <Text style={styles.settingDescription}>
                Automatically read recognized text aloud
              </Text>
            </View>
            <Switch
              value={speechEnabled}
              onValueChange={(value) => {
                setSpeechEnabled(value);
                saveSetting('speechEnabled', value);
              }}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Feedback Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Feedback</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <Text style={styles.settingDescription}>
                Haptic feedback for scanning and recognition
              </Text>
            </View>
            <Switch
              value={vibrationsEnabled}
              onValueChange={(value) => {
                setVibrationsEnabled(value);
                saveSetting('vibrationsEnabled', value);
              }}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Developer Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Developer</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Debug Mode</Text>
              <Text style={styles.settingDescription}>
                Show detailed processing information
              </Text>
            </View>
            <Switch
              value={debugMode}
              onValueChange={(value) => {
                setDebugMode(value);
                saveSetting('debugMode', value);
              }}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>AI Model</Text>
            <Text style={styles.aboutValue}>Gemini 2.5 Flash Lite via OpenRouter</Text>
          </View>

          <Text style={styles.aboutDescription}>
            This app uses Google's Gemini 2.5 Flash Lite through OpenRouter for accurate, 
            real-time Braille text recognition. The AI model is optimized for ultra-low 
            latency and cost efficiency at just $0.10 per million input tokens.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#263238',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  aboutValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
});