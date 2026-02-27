# 🌸 東北櫻花之旅 - Android 版本

## 📱 專案說明

這是東北櫻花之旅行程規劃 App 的 Android 版本，使用 **Capacitor + Next.js** 建置。

---

## 🚀 快速開始

### 系統需求
- Node.js 18+
- Java JDK 17+
- Android Studio
- Android SDK

### 安裝步驟

```bash
# 1. 進入專案目錄
cd /Volumes/Date/app/test_app/TohokuTripAndroid

# 2. 安裝依賴
npm install

# 3. 建置靜態網站
npm run build

# 4. 初始化 Capacitor
npx cap init TohokuTrip com.jkhomeclaw.tohokutrip --web-dir out

# 5. 添加 Android 平台
npx cap add android

# 6. 同步程式碼
npx cap sync

# 7. 開啟 Android Studio
npx cap open android
```

---

## 📦 建置 APK

在 Android Studio 中：
1. 選擇 `Build → Build Bundle(s) / APK(s) → Build APK(s)`
2. 或選擇 `Build → Generate Signed Bundle / APK` 建立發布版本

---

## 🔧 主要修改

### 與桌面版差異
| 功能 | 桌面版 | Android 版 |
|------|--------|-----------|
| 資料來源 | API 呼叫 | 本地 JSON |
| 編輯功能 | ✅ 完整支援 | ⚠️ 僅限檢視 |
| 地圖導航 | 外部連結 | 開啟 Google Maps App |
| 主題切換 | ✅ 支援 | ✅ 支援 |
| 離線使用 | ❌ | ✅ |

---

## 📁 檔案結構

```
TohokuTripAndroid/
├── app/                    # Next.js 頁面
├── android/                # Android 原生專案（由 Capacitor 生成）
├── out/                    # 建置輸出
├── public/                 # 靜態資源
│   └── data.json          # 行程資料
├── components/             # React 元件
└── capacitor.config.ts     # Capacitor 設定
```

---

## 📝 注意事項

1. **首次建置**會比較慢，需要下載 Android SDK
2. **資料更新**：修改 `public/data.json` 後需重新建置
3. **測試**：可以使用 Android 模擬器或實機測試

---

## 🐛 疑難排解

### Gradle 建置失敗
```bash
cd android
./gradlew clean
./gradlew build
```

### Capacitor 同步失敗
```bash
rm -rf android
npx cap add android
npx cap sync
```

---

## 📄 授權

個人使用專案
