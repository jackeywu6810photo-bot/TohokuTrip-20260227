#!/bin/bash

# ==========================================
# 東北櫻花之旅 Android 建置腳本
# ==========================================

set -e

echo "🌸 東北櫻花之旅 Android 建置器"
echo "======================================"
echo ""

PROJECT_DIR="/Volumes/Date/app/test_app/TohokuTripAndroid"
cd "$PROJECT_DIR"

# 檢查相依性
if ! command -v node &> /dev/null; then
    echo "❌ 找不到 Node.js"
    echo "請執行: brew install node"
    exit 1
fi

# 步驟 1: 安裝依賴
echo "📦 步驟 1/4: 安裝 npm 依賴..."
npm install

# 步驟 2: 建置 Next.js
echo "📦 步驟 2/4: 建置 Next.js..."
npm run build

# 步驟 3: 初始化 Capacitor（如果尚未初始化）
if [ ! -d "android" ]; then
    echo "📦 步驟 3/4: 初始化 Capacitor..."
    npx cap init TohokuTrip com.jkhomeclaw.tohokutrip --web-dir out
    npx cap add android
else
    echo "📦 步驟 3/4: 同步 Capacitor..."
    npx cap sync
fi

# 步驟 4: 建置 APK
echo "📦 步驟 4/4: 建置 APK..."
cd android
./gradlew assembleDebug

echo ""
echo "======================================"
echo "✅ 建置完成！"
echo "======================================"
echo ""
echo "📁 APK 位置:"
echo "   $PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🚀 安裝到手機:"
echo "   adb install $PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

# 開啟 Finder
open "$PROJECT_DIR/android/app/build/outputs/apk/debug/" 2>/dev/null || true
