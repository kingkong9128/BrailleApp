#!/bin/bash

echo "🚀 Building Clean BrailleApp APK..."

# Step 1: Clean everything
echo "🧹 Cleaning project..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .expo

# Step 2: Install dependencies
echo "📦 Installing clean dependencies..."
npm install

# Step 3: Check for issues
echo "🔍 Running diagnostics..."
npx expo-doctor || echo "Some warnings are OK, continuing..."

# Step 4: Create EAS build with auto-answers
echo "🏗️ Building APK with EAS..."
echo -e "Y\nY\nY\n" | eas build --platform android --profile preview

echo "✅ Build initiated! Check https://expo.dev for download link."
echo "📱 Your APK will be ready in 5-10 minutes." 