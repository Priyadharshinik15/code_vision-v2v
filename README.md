# Rakshita — Women's Safety Mobile App

![Rakshita Logo](rakshita-mobile/assets/logo.png)

**"Because every woman deserves to feel safe, always."**

Rakshita is a comprehensive women's safety mobile application designed to provide quick, reliable emergency assistance through a React Native app (Expo) backed by a Python Flask server.

## 🎯 Overview

Rakshita empowers women with intelligent safety features including one-tap emergency alerts, voice-activated SOS, location sharing, emergency camera mode, and offline beacon support. The app combines modern mobile technology with practical safety features to create a comprehensive safety network.

## ✨ Key Features

### Emergency Response
- **🆘 Emergency SOS** — One-tap panic button with automatic contact notification
- **🎙️ Voice Trigger** — Hands-free emergency activation via voice command
- **📍 Live Location Sharing** — Real-time GPS location tracking during emergencies
- **📸 Emergency Camera Mode** — Quick photo/video capture for evidence documentation

### Safety Network
- **👥 Trusted Contacts** — Manage emergency contact list (up to 5 contacts)
- **📞 SMS & Call Alerts** — Automatic emergency notifications to contacts
- **🗺️ Safety Map** — View nearby incidents and safe zones
- **🛡️ Offline Beacon** — BLE (Bluetooth Low Energy) emergency signaling when offline

### Verification & Reporting
- **✅ KYC Verification** — Aadhaar-based identity verification (optional)
- **📝 Incident Reporting** — Report and track safety incidents
- **📊 Analytics Dashboard** — Personal safety statistics and incident history

### Admin Features
- **👨‍💼 Admin Dashboard** — Monitor reports, manage users, view incidents
- **📈 System Analytics** — Real-time incident tracking and patterns
- **⚙️ User Management** — Approve, suspend, or manage user accounts

### Accessibility
- **🌐 Multilingual Support** — English, Hindi, Tamil, Hinglish, Tanglish
- **🎨 Intuitive UI** — User-friendly design optimized for emergency use
- **♿ Accessibility First** — Large buttons, high contrast, clear navigation

## 🛠️ Tech Stack

### Mobile App (`rakshita-mobile/`)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack)
- **Maps**: React Native Maps (Google Maps integration)
- **Permissions**: Expo Location, Camera, Sensors
- **BLE**: React Native BLE PLX for offline beacon support
- **Voice**: React Native Voice for voice commands
- **Storage**: Expo Secure Store for encrypted credentials
- **UI**: Expo Linear Gradient, SVG support, custom theme system

### Backend (`rakshita/`)
- **Framework**: Python Flask 3.0.3
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Session-based + Token-based (for mobile API)
- **API**: REST API with CORS support for mobile clients
- **Security**: CSRF protection, password hashing with Werkzeug
- **Geolocation**: Geopy for distance calculations
- **SMS**: Optional Twilio integration for SMS alerts
- **CV/ML**: OpenCV (optional) for Aadhaar QR code processing

## 📱 Download & Installation

### For Users (Android)
Download the latest APK from releases:
- **[Download Rakshita APK v1.0.0](https://github.com/Priyadharshinik15/code_vision-v2v/releases)**

**Installation Steps:**
1. Download the APK file to your Android device
2. Open file manager and navigate to Downloads
3. Tap on the APK file to install
4. Grant required permissions when prompted
5. Launch Rakshita from your app drawer

**QR Code:**








<img width="540" height="540" alt="Rakshita-Download-QR" src="https://github.com/user-attachments/assets/ce005de5-2e3a-40c0-b172-25de5a22275b" />








**Required Permissions:**
- Location (Fine & Coarse) — For emergency location sharing
- Camera — For emergency mode photo/video capture
- Microphone — For voice SOS trigger
- Bluetooth — For offline beacon support
- Phone State — For emergency call detection

### For Developers

#### Prerequisites
- **Node.js** 16+ and npm 8+
- **Python** 3.8+ and pip
- **Expo CLI**: `npm install -g eas-cli`
- **Git** for version control
- Android Studio (for Android testing) — *optional*
- Xcode (for iOS testing) — *optional, macOS only*

#### Setup Mobile App
```bash
cd rakshita-mobile
npm install
npx expo start
```

Then:
- Press `a` to open in Android Emulator
- Press `w` to open in web browser
- Press `i` to open in iOS Simulator (macOS only)
- Scan QR code with Expo Go app on physical device

#### Setup Backend (Flask)
```bash
cd rakshita
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

#### Quick Setup (All-in-One)
```bash
python setup.py
```

## 📁 Project Structure

```
rakshita-full/
├── rakshita-mobile/              # React Native Expo app
│   ├── src/
│   │   ├── screens/              # App screens
│   │   │   ├── LandingScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── MapScreen.js
│   │   │   ├── ContactsScreen.js
│   │   │   ├── ReportScreen.js
│   │   │   ├── AdminScreen.js
│   │   │   └── KYCScreen.js
│   │   ├── components/           # Reusable UI components
│   │   │   ├── DecorativeBackground.js
│   │   │   ├── EmergencyModeCamera.js
│   │   │   ├── RakshitaLogo.js
│   │   │   └── UI.js
│   │   ├── context/              # React context
│   │   │   └── AuthContext.js
│   │   ├── hooks/                # Custom hooks
│   │   │   └── useShakeDetection.js
│   │   ├── native/               # Native modules
│   │   │   ├── BleBeacon.js      # Offline BLE signaling
│   │   │   └── VoiceTrigger.js   # Voice command processing
│   │   ├── theme/
│   │   │   └── colors.js         # Color palette
│   │   └── api/
│   │       └── client.js         # API client with axios
│   ├── assets/                   # Images, logos, backgrounds
│   ├── App.js                    # Root component
│   ├── app.json                  # Expo config
│   └── package.json
│
├── rakshita/                     # Flask backend
│   ├── app.py                    # Main Flask app
│   ├── models.py                 # Database models
│   ├── forms.py                  # WTForms definitions
│   ├── mobile_api.py             # Mobile API blueprint
│   ├── aadhaar_kyc.py            # KYC processing
│   ├── templates/                # HTML templates
│   │   ├── base.html             # Base template
│   │   ├── landing.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── map.html
│   │   ├── contacts.html
│   │   ├── report.html
│   │   ├── kyc.html
│   │   ├── admin.html
│   │   └── _navbar.html
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── dashboard.js
│   │   │   └── map.js
│   │   └── img/
│   ├── instance/                 # Instance folder (created at runtime)
│   ├── requirements.txt
│   └── .env                      # Environment variables (create from .env.example)
│
├── .env.example                  # Environment template
├── setup.py                      # Setup script
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Building Android APK

#### Using EAS Build (Recommended)
```bash
cd rakshita-mobile

# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo account
eas login

# Build APK
eas build --platform android --profile production

# Download the APK from the link provided
```

#### Building Locally (Advanced)
Requires Android SDK and build tools:
```bash
cd rakshita-mobile
eas build --platform android --local
```

### Deploying Backend (Flask)

#### Local Deployment
```bash
cd rakshita
python app.py
# Runs on http://localhost:5000
```

#### Cloud Deployment Options
- **Heroku**: `heroku create` + `git push heroku main`
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Simple Flask hosting, free tier available
- **PythonAnywhere**: Python-specific hosting
- **AWS/Google Cloud**: Full control, pay-as-you-go

**Example Heroku Deployment:**
```bash
# Install Heroku CLI
heroku login
heroku create rakshita-app
echo "web: gunicorn rakshita.app:app" > Procfile
git push heroku main
```

## 📖 API Documentation

### Mobile API Endpoints

All mobile endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer {user_token}
```

#### Authentication
- `POST /api/mobile/register` — Register new user
- `POST /api/mobile/login` — User login
- `POST /api/mobile/logout` — User logout

#### Contacts
- `GET /api/mobile/contacts` — Get emergency contacts
- `POST /api/mobile/contacts` — Add new contact
- `DELETE /api/mobile/contacts/{id}` — Remove contact

#### SOS Alerts
- `POST /api/mobile/sos` — Trigger SOS alert
- `GET /api/mobile/sos-history` — Get past alerts
- `POST /api/mobile/sos/{id}/location` — Update SOS location

#### Location & Map
- `GET /api/mobile/nearby-incidents` — Get nearby incidents
- `POST /api/mobile/location` — Send current location

#### Incident Reporting
- `POST /api/mobile/report` — File incident report
- `GET /api/mobile/reports` — Get user reports

#### KYC Verification
- `POST /api/mobile/kyc/verify` — Verify Aadhaar
- `GET /api/mobile/kyc/status` — Get KYC status

## 🔐 Security & Privacy

### Encryption
- **Passwords**: Bcrypt hashing (Werkzeug)
- **Tokens**: JWT-based authentication
- **Credentials**: Encrypted storage via Expo Secure Store
- **Location**: HTTPS-only transmission

### Privacy Features
- **Minimal Data Collection**: Only essential safety information
- **Local Processing**: Shake detection happens on device
- **No Tracking**: Location only shared during SOS
- **Automatic Cleanup**: SOS alerts cleared after 24 hours
- **GDPR Compliant**: Full data export and deletion options

### Permissions Model
- Location: Only during emergency or when enabled
- Camera: Only in emergency mode or user-initiated
- Contacts: Only for adding emergency contacts
- Call/SMS: Only for emergency notifications

## 📝 Environment Variables

Create a `.env` file in the `rakshita/` directory (copy from `.env.example`):

```env
# Flask Configuration
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///rakshita.db
FLASK_ENV=production

# Admin emails (auto-promoted to admin on register)
ADMIN_EMAILS=admin@example.com,superadmin@example.com

# Optional: Twilio SMS Integration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890

# Optional: Aadhaar KYC Feature
AADHAAR_KYC_ENABLED=false
```

## 🧪 Testing

### Mobile App Testing
```bash
cd rakshita-mobile

# Run on physical device with Expo Go
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (macOS only)
npx expo start --ios
```

### Backend Testing
```bash
cd rakshita
python -m pytest tests/

# Or with coverage
python -m pytest --cov=.
```

## 🐛 Known Issues & Limitations

1. **Offline Beacon**: Requires paired Bluetooth devices for full functionality
2. **iOS Build**: Apple Review may require additional justification for extensive permissions
3. **SMS Alerts**: Requires Twilio account configuration
4. **Location Accuracy**: GPS accuracy varies by environment (5-15m typical)

## 📞 Support & Contact

### Getting Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/Priyadharshinik15/code_vision-v2v/issues)
- **Email**: Contact the team at [your-email]
- **Documentation**: See [Wiki](https://github.com/Priyadharshinik15/code_vision-v2v/wiki)

### Emergency Resources
If you're in danger, please contact:
- **India**: National Women Helpline — 1090
- **India**: AIWC — +91-11-4141-4141
- **US**: National Domestic Violence Hotline — 1-800-799-7233
- **Global**: Find local resources at [safetonet.com](https://safetonet.com)

## 🙏 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

## 👥 Team

- **Shamritha GS** — [GitHub](https://github.com/ShamrithaGS)
- **Priyadharshini K** — [GitHub](https://github.com/Priyadharshinik15)
- **Deepika Devi P** - [GitHub](https://github.com/DeepikaDevi2906)
- **Kasturi E** - [GitHub](https://github.com/kasthuri06)

## 🙌 Acknowledgments

- **React Native & Expo** — For incredible cross-platform development
- **Flask** — For reliable Python web framework
- **Community** — For feedback and support

---

## 📊 Project Stats

- **Mobile Lines of Code**: ~2,500+ (React Native + JavaScript)
- **Backend Lines of Code**: ~1,500+ (Python/Flask)
- **Supported Platforms**: Android, iOS (React Native), Web (Flask)
- **Development Time**: Multiple phases with continuous improvement
- **Last Updated**: July 2026

---

**Made with ❤️ for every woman who deserves to feel safe, always.**

🛡️ **Your Safety. Our Priority.**

