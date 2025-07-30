#!/bin/bash

echo "🔧 FIXING THE FUCKING PROJECT..."

# Clean everything
rm -rf node_modules package-lock.json .expo

# Install working versions
echo "📦 Installing WORKING dependencies..."
npm install

# Replace eas.json with minimal one
cp minimal-eas.json eas.json

# Build the damn APK
echo "🚀 Building APK..."
eas build --platform android --profile preview --non-interactive --auto-submit

echo "✅ Done! Check https://expo.dev for your APK" 