# 🤖 AI-Powered Braille Text Recognition App

A React Native app that uses **Google Gemini 2.5 Flash Lite** via [OpenRouter](https://openrouter.ai/google/gemini-2.5-flash-lite) to accurately recognize Braille text from camera images.

## ✨ Features

- **🤖 Real AI Recognition**: Uses Google Gemini 2.5 Flash Lite for accurate Braille reading
- **📱 Real-time Camera Scanning**: Capture Braille text using your device's camera  
- **🎯 High Accuracy**: AI provides much better recognition than traditional computer vision
- **🔊 Text-to-Speech**: Automatic reading of recognized text
- **📝 History Tracking**: Save and review previous scans
- **🛠️ Debug Mode**: Detailed processing information for development
- **⚡ Ultra-Fast Processing**: AI analysis completes in 1-2 seconds
- **💰 Cost Effective**: Only $0.10 per million input tokens via OpenRouter

## 🚀 How It Works

### Real AI-Powered Pipeline

1. **📸 Image Capture**: High-quality camera capture optimized for Braille
2. **🔄 Image Processing**: Automatic resizing and compression for AI analysis  
3. **🤖 AI Analysis**: Google Gemini 2.5 Flash Lite identifies and reads Braille patterns
4. **📝 Text Conversion**: AI converts Braille to readable text with confidence scores
5. **🔊 Output**: Text-to-speech and visual display of results

## 🔧 Setup

### Get Your OpenRouter API Key
1. **Sign up**: Go to [openrouter.ai](https://openrouter.ai) 
2. **Get API Key**: Create a free account and generate an API key
3. **Configure**: Open the app → Settings → Add your API key
4. **Start Scanning**: Real AI recognition is now active!

### Cost Information
- **Model**: [Gemini 2.5 Flash Lite](https://openrouter.ai/google/gemini-2.5-flash-lite)
- **Pricing**: $0.10 per million input tokens, $0.40 per million output tokens
- **Typical Cost**: ~$0.001 per image scan (very affordable!)

## 📱 Getting Started

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Test on mobile device
# Use Expo Go app to scan QR code
```

## 🎯 Usage

1. **Add API Key**: Go to Settings and configure your OpenRouter API key
2. **Grant Camera Permission**: Allow camera access when prompted
3. **Position Braille**: Place Braille text within the scanning frame
4. **Capture**: Tap "Capture & Analyze" button
5. **Listen**: AI-recognized text is automatically spoken aloud

### For Best Results
- **📷 Good Lighting**: Ensure clear contrast between dots and background
- **📐 Proper Distance**: Hold device 6-12 inches from Braille text  
- **🎯 Center Text**: Position Braille within the scanning frame
- **📱 Steady Hold**: Keep device stable during capture

## 🔮 Why This AI Approach is Superior

### Traditional Computer Vision Problems:
- ❌ Complex algorithms with many edge cases
- ❌ Sensitive to lighting and image quality  
- ❌ Requires extensive tuning and calibration
- ❌ Poor accuracy with real-world variations
- ❌ Slow processing with multiple stages

### AI Vision Advantages:
- ✅ **Trained on millions of images** - handles variations naturally
- ✅ **Context awareness** - understands Braille patterns holistically  
- ✅ **Robust to conditions** - works in various lighting and angles
- ✅ **Simple integration** - just send image, get text back
- ✅ **Continuously improving** - benefits from Google's model updates
- ✅ **Ultra-low latency** - optimized for speed and efficiency

## 🛠️ Development

### Debug Information
Enable debug mode in Settings to see:
- 📊 AI processing steps and timing
- 🔍 Confidence scores and estimates  
- 📐 Image dimensions and processing info
- ⚡ Performance metrics
- 🔗 API connection status

### Error Handling
The app gracefully handles:
- **API Key Issues**: Clear error messages with setup instructions
- **Network Problems**: Retry mechanisms and offline fallbacks
- **Image Quality**: Feedback for better positioning and lighting
- **Rate Limits**: Automatic backoff and user notifications

## 🚀 API Integration Details

### OpenRouter Configuration
```typescript
// Automatic API key loading from settings
const recognizer = new BrailleRecognizer();
await recognizer.setOpenRouterApiKey(apiKey);

// Recognition with real AI
const result = await recognizer.recognizeFromImageUri(imageUri);
```

### AI Prompt
The app sends carefully crafted prompts to Gemini 2.5 Flash Lite:
- Specific instructions for Braille pattern recognition
- JSON response format requirements
- Confidence scoring guidelines
- Error handling instructions

## 📦 Dependencies

- **🔗 openai**: OpenAI SDK for OpenRouter API communication
- **📷 expo-camera**: Camera access and image capture
- **🖼️ expo-image-manipulator**: Image preprocessing  
- **🔊 expo-speech**: Text-to-speech functionality
- **⚛️ React Native**: Cross-platform mobile framework

## 🎖️ Why This Implementation Rocks

Instead of fighting with complex computer vision algorithms, we use Google's state-of-the-art AI through OpenRouter's convenient API. The result is:

- **🎯 Much higher accuracy** than traditional approaches
- **⚡ Faster development** - no algorithm tuning needed
- **🔧 Easier maintenance** - AI handles edge cases automatically
- **📈 Better user experience** - more reliable results
- **💰 Cost effective** - pay only for what you use
- **🌐 Always improving** - benefits from Google's continuous model updates

The app works immediately once you add your OpenRouter API key - no complex setup or training required! 🚀

## 🔐 Privacy & Security

- **🔒 API keys stored securely** in device storage
- **📱 Images processed temporarily** - not stored by AI service
- **🛡️ HTTPS encryption** for all API communications
- **🏠 On-device history** - your scans stay private
