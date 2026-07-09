# Rakshita — Mobile App (React Native / Expo)

Talks to the same Flask backend as the web app (`../rakshita`), via a new
token-authenticated `/api/mobile/*` API. No backend logic was duplicated —
SOS, Twilio-or-log fallback, contacts, incidents, and Aadhaar KYC all reuse
the same models and the same `send_sms()` function as the web app.

## What's real and working right now

| Feature | Status |
|---|---|
| Register / Login / Logout (token auth) | ✅ Working, tested against the Flask API |
| SOS button | ✅ Working — gets GPS, calls `/api/mobile/sos` |
| **Shake-to-SOS** | ✅ **Actually working**, via `expo-sensors` Accelerometer — runs in Expo Go, no custom build needed |
| **Emergency Mode camera capture** | ✅ **Actually working**, via `expo-camera` — foreground only (see below) |
| Live Safety Signal polling | ✅ Working, same 8s cadence as web |
| Emergency contacts (add/remove, max 5) | ✅ Working |
| Community incident reporting + map | ✅ Working — map is Leaflet in a WebView, not a native map (see notes) |
| Admin dashboard | ✅ Working, role-gated via the same `/api/mobile/admin/*` endpoints |
| Aadhaar KYC upload | ✅ Working — same non-signature-verified QR read as the web app |
| Voice SOS trigger | ⚠️ Code is written and wired up, but **requires a custom dev client** — will not run in Expo Go. See below. |
| BLE mesh Beacon Relay | ⚠️ Scanning proof-of-concept only, **requires a custom dev client**, and peripheral-mode advertising isn't wired up yet. See below. |

## Why voice and BLE need extra setup — the honest version

Both `@react-native-voice/voice` and `react-native-ble-plx` are **native
modules**. Expo Go is a pre-built app that only contains the native code
Expo ships by default — it can't load arbitrary native modules you add to
`package.json`. To use these two features you need a **custom dev client**:

```bash
npx expo install @react-native-voice/voice react-native-ble-plx
eas build --profile development --platform android   # or --platform ios
# once installed on your device/emulator:
npx expo start --dev-client
```

This requires an [Expo (EAS)](https://expo.dev) account (free tier is fine)
and, for iOS, an Apple developer account to install a dev build on a
physical device.

Beyond the build-tooling gap, there are real OS limits worth knowing before
you demo this:

- **Voice trigger** only listens while the app is open and in the
  foreground. Both platforms restrict background microphone access hard —
  correctly, for privacy. What's here is a genuine foreground trigger, not
  an always-on wake word.
- **BLE mesh relay**: `react-native-ble-plx` only does the *central* role
  (scanning/connecting). Actually broadcasting a beacon that other phones
  can discover needs a *peripheral*-mode library too (e.g.
  `react-native-ble-advertiser`), which isn't wired up in this scaffold —
  see the comment block at the top of `src/native/BleBeacon.js` for exactly
  what's implemented vs. what's sketched as a next step. True background
  relaying (a stranger's phone forwarding your beacon without their app
  open) needs a persistent foreground service on Android and hits hard
  limits on iOS background BLE advertising — this is real additional native
  work, not a config flag.

The honestly-demoable version: two phones, both with a Rakshita dev build
open, in Bluetooth range — trigger offline SOS on one, watch the other
discover it. That's what's scaffolded; production-grade background mesh
relay is the clear next milestone, same as flagged for the web build.

## Setup

```bash
cd rakshita-mobile
npm install
```

Edit `src/api/client.js` and point `API_BASE_URL` at your running Flask
server's LAN IP (not `localhost` — your phone can't resolve that back to
your dev machine):

```js
export const API_BASE_URL = "http://192.168.1.20:5000";
```

Or set it via env when starting Expo:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:5000 npx expo start
```

Then:
```bash
npx expo start
```
Scan the QR code with Expo Go (iOS/Android) for everything except voice
and BLE. For those two, follow the dev-client steps above.

## Project structure

```
rakshita-mobile/
  App.js                       # navigation root, auth-aware routing
  src/
    api/client.js                # axios instance, bearer token injection
    context/AuthContext.js        # register/login/logout, session bootstrap
    theme/colors.js                # same palette as the web app
    components/
      RakshitaLogo.js               # same shield+silhouette logo, as SVG
      UI.js                          # shared buttons/fields/cards
      EmergencyModeCamera.js          # REAL foreground camera capture
    hooks/
      useShakeDetection.js           # REAL accelerometer shake-to-SOS
    native/
      VoiceTrigger.js                # voice trigger — needs dev client
      BleBeacon.js                    # BLE relay PoC — needs dev client
    screens/
      LandingScreen.js, RegisterScreen.js, LoginScreen.js
      DashboardScreen.js             # SOS, shake, camera, live signal
      ContactsScreen.js, MapScreen.js, ReportScreen.js
      AdminScreen.js, KYCScreen.js
```

## Backend requirement

Run the Flask app from `../rakshita` first (`python3 app.py`) — this app is
just a client for it. If you want Aadhaar KYC to work on mobile too, start
Flask with `AADHAAR_KYC_ENABLED=true`.
