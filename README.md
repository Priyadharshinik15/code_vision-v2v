# Rakshita — Women's Safety App

Rakshita is a women's safety mobile application designed to provide quick, reliable emergency assistance through a React Native app backed by a Python (Flask) server.

## Features

- **Emergency SOS** — trigger alerts via shake detection or voice command
- **BLE Beacon Support** — nearby device-based emergency signaling
- **Live Location Sharing** — real-time map tracking during emergencies
- **Emergency Camera Mode** — quick photo/video capture during incidents
- **Trusted Contacts** — manage emergency contacts for alerts
- **KYC Verification** — Aadhaar-based identity verification
- **Incident Reporting** — report and track safety incidents
- **Admin Dashboard** — monitor reports and manage users
- **Multilingual Support** — English, Hindi, and Tamil/Hinglish/Tanglish

## Tech Stack

**Mobile App (`rakshita-mobile/`)**
- React Native (Expo)
- React Navigation

**Backend (`rakshita/`)**
- Python (Flask)
- REST API for mobile client

## Project Structure
rakshita-full/
├── rakshita-mobile/     # React Native mobile app
│   ├── src/
│   │   ├── screens/     # App screens (Login, Dashboard, Map, etc.)
│   │   ├── components/  # Reusable UI components
│   │   ├── native/      # BLE & Voice trigger modules
│   │   └── context/     # Auth context
│   └── App.js
│
└── rakshita/             # Flask backend
├── app.py
├── models.py
├── forms.py
└── templates/
## Getting Started

### Mobile App
```bash
cd rakshita-mobile
npm install
npx expo start
```

### Backend
```bash
cd rakshita
pip install -r requirements.txt
python app.py
```

## Status

🚧 Under active development.
