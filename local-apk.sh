#!/bin/bash

echo "🔥 BUILDING LOCAL APK RIGHT NOW..."

# Install expo-dev-client for local builds
npm install expo-dev-client

# Update app.json for dev build
cat > app.json << 'EOF'
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
      "expo-camera",
      "expo-dev-client"
    ],
    "extra": {
      "eas": {
        "projectId": "2be6d3fe-fc2e-46f9-b222-f9cac3fd3dd7"
      }
    }
  }
}
EOF

# Try to build locally with Expo CLI
echo "🚀 Attempting local build..."
npx expo run:android --variant release || echo "Local build failed - use Snack method instead"

echo "✅ If local build failed, use the INSTANT_APK_GUIDE.md method!" 