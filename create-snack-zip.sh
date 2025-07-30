#!/bin/bash

echo "📦 Creating Expo Snack package..."

# Create temp directory for snack files
mkdir -p braille-app-snack

# Copy all necessary files
cp -r app braille-app-snack/
cp -r utils braille-app-snack/
cp -r hooks braille-app-snack/
cp -r assets braille-app-snack/

# Create Snack-compatible package.json
cat > braille-app-snack/package.json << 'EOF'
{
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start"
  },
  "dependencies": {
    "@expo/vector-icons": "*",
    "@react-native-async-storage/async-storage": "*",
    "expo": "*",
    "expo-camera": "*",
    "expo-constants": "*",
    "expo-font": "*",
    "expo-haptics": "*",
    "expo-image-manipulator": "*",
    "expo-linking": "*",
    "expo-router": "*",
    "expo-speech": "*",
    "expo-splash-screen": "*",
    "expo-status-bar": "*",
    "expo-system-ui": "*",
    "expo-web-browser": "*",
    "openai": "*",
    "react": "*",
    "react-dom": "*",
    "react-native": "*",
    "react-native-reanimated": "*",
    "react-native-safe-area-context": "*",
    "react-native-screens": "*",
    "react-native-web": "*"
  }
}
EOF

# Create Snack-compatible app.json
cat > braille-app-snack/app.json << 'EOF'
{
  "expo": {
    "name": "BrailleApp",
    "slug": "braille-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "android": {
      "package": "com.saubhagya.brailleapp",
      "permissions": [
        "android.permission.CAMERA"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-camera"
    ]
  }
}
EOF

# Create ZIP file
cd braille-app-snack
zip -r ../BrailleApp-Snack.zip . -x "*.DS_Store" "node_modules/*" ".expo/*"
cd ..

echo "✅ Created BrailleApp-Snack.zip"
echo ""
echo "🚀 UPLOAD TO SNACK:"
echo "1. Go to https://snack.expo.dev"
echo "2. Click 'Import project'"
echo "3. Upload BrailleApp-Snack.zip"
echo "4. Click 'My Device' → 'Download APK'"
echo "5. APK ready in 3-5 minutes!"

# Clean up
rm -rf braille-app-snack 