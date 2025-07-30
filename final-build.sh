#!/bin/bash

echo "🔥 FINAL APK BUILD ATTEMPT..."

# Clean everything 
rm -rf node_modules package-lock.json .expo

# Install with older working versions
echo "📦 Installing older working versions..."
npm install --legacy-peer-deps

# Use minimal EAS config
cp minimal-eas.json eas.json

echo "🚀 Building APK..."
eas build --platform android --profile preview

echo "✅ Check https://expo.dev for your APK!" 