# Building & Deploying Rakshita Android APK

## 📱 Option 1: Build with EAS Build (Recommended)

This is the easiest method for building production-ready APKs without local setup.

### Prerequisites
- Expo account (free): https://expo.dev
- EAS CLI installed: `npm install -g eas-cli`
- GitHub repo with the code

### Step-by-Step Build

```bash
# 1. Navigate to mobile app directory
cd rakshita-mobile

# 2. Login to Expo
eas login

# 3. Configure EAS project (if not already done)
eas build:configure

# 4. Build APK for production
eas build --platform android --profile production

# 5. Wait for build to complete (takes 5-10 minutes)
# You'll get a link to download the APK

# 6. Download the APK from the provided link
```

### Creating a Release on GitHub

Once you have the APK:

```bash
# Create a new release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Upload APK to GitHub Releases via web interface
# 1. Go to: https://github.com/Priyadharshinik15/code_vision-v2v/releases
# 2. Click "Create a new release"
# 3. Tag: v1.0.0
# 4. Upload the APK file
# 5. Publish release
```

---

## 📦 Option 2: Build Locally (Advanced)

Requires Android SDK and more setup time.

### Prerequisites
- Android Studio installed
- Android SDK 29+ (API level 29)
- Java Development Kit (JDK) 11+
- At least 5GB free disk space

### Build Steps

```bash
cd rakshita-mobile

# Install dependencies
npm install

# Generate native code
npx expo prebuild --clean

# Build APK
cd android
./gradlew assembleRelease

# Find APK at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 Build Profiles

### Development APK (for testing)
```bash
eas build --platform android --profile development
# Includes development tools and debugging info
# Larger file size (~50-80MB)
```

### Production APK (for release)
```bash
eas build --platform android --profile production
# Optimized for size and performance
# Smaller file size (~30-50MB)
# Ready for Google Play Store
```

---

## 📲 Installation on Users' Devices

### Method 1: Direct APK Download
1. Download APK from GitHub Releases
2. Transfer to Android phone (USB or email)
3. Open file manager → Downloads
4. Tap APK file to install
5. Allow installation from unknown sources if prompted
6. Grant permissions when asked

### Method 2: Google Play Store (Future)
1. Create Google Play Developer account ($25 one-time)
2. Upload signed APK to Play Store
3. Users can search for "Rakshita" and install directly

### Method 3: Firebase App Distribution (Testing)
```bash
# For distributing to test users before Play Store
eas build --platform android --profile production
eas submit --platform android --type app-bundle
```

---

## 🔍 Troubleshooting

### Build Failed Error
- **Check**: Node.js version is 16+ (`node --version`)
- **Check**: npm packages are up to date (`npm update`)
- **Try**: `npm ci` instead of `npm install`

### "Build failed" on EAS
- Wait 5 minutes and try again
- Check Expo status: https://status.expo.io
- Clear cache: `eas build --platform android --clear-cache`

### APK Won't Install
- Check Android version is 8.0+
- Uninstall previous version first
- Ensure you have enough storage (~100MB)
- Enable "Unknown Sources" in Settings > Security

### App Crashes After Install
- Grant all required permissions
- Check internet connection
- Restart phone
- Check logs: `adb logcat | grep Rakshita`

---

## 📊 Build Statistics

| Metric | Value |
|--------|-------|
| Min Android Version | 8.0 (API 26) |
| Target Android Version | 14 (API 34) |
| APK Size | ~40-50MB |
| Build Time | 5-10 minutes |
| Memory Required | 4GB+ |

---

## 🔐 Security Notes

### Signing the APK
EAS Build automatically signs APKs with a managed key for you.

### Production Signing
For Google Play Store submission:
```bash
# Create your own keystore
keytool -genkey -v -keystore rakshita.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias rakshita-key

# Use in EAS build
eas build --platform android --profile production
```

### Store Private Key Securely
- Never commit private keys to Git
- Store in secure location
- Backup in safe place
- Only share with authorized team members

---

## 🚀 Deployment Checklist

- [ ] Code is committed and pushed to GitHub
- [ ] README is updated with latest features
- [ ] Environment variables are configured
- [ ] App version number updated in `app.json`
- [ ] All features tested on physical device
- [ ] No console errors in debug mode
- [ ] APK built successfully
- [ ] APK tested on physical Android device
- [ ] Release notes prepared
- [ ] GitHub release created with APK
- [ ] Users notified of new release

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [React Native Android Guide](https://reactnative.dev/docs/android-setup)
- [Google Play Console](https://play.google.com/console)

---

**Questions?** Check the main [README.md](README.md) or open an issue on GitHub.
