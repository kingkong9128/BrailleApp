#!/bin/bash

echo "🚀 Building BrailleApp APK locally..."

# Remove problematic dependencies
echo "📦 Cleaning up dependencies..."
npm uninstall expo-gl expo-gl-cpp

# Install fixed dependencies  
echo "📦 Installing dependencies..."
npm install

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
npx expo install --fix

# Create development build
echo "🔨 Creating development build..."
npx expo install expo-dev-client

# Update app.json for development build
echo "📝 Configuring for development build..."
cat > app.json << 'EOF'
{
  "expo": {
    "name": "BrailleApp",
    "slug": "braille-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.saubhagya.brailleapp",
      "permissions": [
        "android.permission.CAMERA"
      ]
    },
    "plugins": [
      "expo-router", 
      "expo-font", 
      "expo-dev-client",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Braille App to access your camera to scan Braille text."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
EOF

# Build APK using EAS
echo "🏗️ Building APK with EAS..."
eas build --platform android --profile preview --non-interactive

echo "✅ APK build completed! Check EAS dashboard for download link." 