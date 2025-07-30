import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speak } from 'expo-speech';
import { 
  Volume2, 
  VolumeX, 
  Info, 
  Zap, 
  Smartphone 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await Promise.all([
        AsyncStorage.getItem('speechEnabled'),
        AsyncStorage.getItem('speechRate'),
        AsyncStorage.getItem('speechPitch'),
        AsyncStorage.getItem('hapticFeedback'),
      ]);

      if (settings[0] !== null) setSpeechEnabled(JSON.parse(settings[0]));
      if (settings[1] !== null) setSpeechRate(parseFloat(settings[1]));
      if (settings[2] !== null) setSpeechPitch(parseFloat(settings[2]));
      if (settings[3] !== null) setHapticFeedback(JSON.parse(settings[3]));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('speechEnabled', JSON.stringify(speechEnabled)),
        AsyncStorage.setItem('speechRate', speechRate.toString()),
        AsyncStorage.setItem('speechPitch', speechPitch.toString()),
        AsyncStorage.setItem('hapticFeedback', JSON.stringify(hapticFeedback)),
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [speechEnabled, speechRate, speechPitch, hapticFeedback]);

  const testSpeech = () => {
    speak('This is a test of the speech settings', {
      language: 'en',
      pitch: speechPitch,
      rate: speechRate,
    });
  };

  const adjustSpeechRate = (increase: boolean) => {
    const newRate = increase 
      ? Math.min(speechRate + 0.1, 2.0)
      : Math.max(speechRate - 0.1, 0.1);
    setSpeechRate(Math.round(newRate * 10) / 10);
  };

  const adjustSpeechPitch = (increase: boolean) => {
    const newPitch = increase 
      ? Math.min(speechPitch + 0.1, 2.0)
      : Math.max(speechPitch - 0.1, 0.1);
    setSpeechPitch(Math.round(newPitch * 10) / 10);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Speech Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Speech Settings</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Speech</Text>
            <Switch
              value={speechEnabled}
              onValueChange={setSpeechEnabled}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={speechEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          {speechEnabled && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Speech Rate: {speechRate}</Text>
                <View style={styles.adjustButtons}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustSpeechRate(false)}
                  >
                    <Text style={styles.adjustButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustSpeechRate(true)}
                  >
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Speech Pitch: {speechPitch}</Text>
                <View style={styles.adjustButtons}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustSpeechPitch(false)}
                  >
                    <Text style={styles.adjustButtonText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustSpeechPitch(true)}
                  >
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.testButton} onPress={testSpeech}>
                <Text style={styles.testButtonText}>Test Speech</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Device Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Device Settings</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={hapticFeedback ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Braille Scanner</Text>
            <Text style={styles.infoVersion}>Version 1.0.0</Text>
            <Text style={styles.infoDescription}>
              A simple and accessible Braille character scanner that converts Braille text to English with voice output support.
            </Text>
            
            <View style={styles.featureList}>
              <Text style={styles.featureTitle}>Features:</Text>
              <Text style={styles.featureItem}>• Camera-based Braille scanning</Text>
              <Text style={styles.featureItem}>• Text-to-speech conversion</Text>
              <Text style={styles.featureItem}>• Scan history storage</Text>
              <Text style={styles.featureItem}>• Accessible interface design</Text>
              <Text style={styles.featureItem}>• Offline functionality</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
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
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoVersion: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  infoDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    marginTop: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 22,
  },
});