# Rakshita — Personal Safety Platform

A working Flask backend + web app matching the Rakshita landing page design,
plus a companion React Native (Expo) mobile app in `../rakshita-mobile` that
talks to the same API.

## What's included and working right now

**Web app**
- **Landing page** — matches the reference design (logo, wordmark, tagline,
  gradient buttons, leaf decorations, footer note)
- **Register / Login / Logout** — hashed passwords (Werkzeug), CSRF-protected
  forms (Flask-WTF)
- **SOS / Emergency Alert** — one tap shares live GPS and "sends" SMS to
  saved emergency contacts (logs to console/DB with no Twilio configured;
  real SMS if Twilio env vars are set)
- **Mark myself safe**, **Emergency Contacts** (up to 5), **Live Safety
  Signal** (polls every 8s within 2km using geopy), **Community Incident
  Reporting**, **Recent Incidents Map** (Leaflet + Chart.js)
- **Admin / Police Dashboard** (`/admin`) — role-gated: filter reports by
  status/category, live stats, update/delete reports, jump to location.
  Promote an account to admin by adding its email to `ADMIN_EMAILS` in `.env`.
- **Aadhaar KYC** (`/kyc`) — off by default (`AADHAAR_KYC_ENABLED=true` to
  turn on). Reads the printed QR via OpenCV, no extra system deps. Clearly
  **not** a UIDAI signature check — see `aadhaar_kyc.py` for the full
  disclosure on what this does and doesn't verify.

**Mobile API** (`/api/mobile/*`, token-authenticated, CORS-enabled) — the
same SOS/contacts/incidents/admin/KYC logic, exposed for the React Native
app. See `mobile_api.py`.

**Mobile app** — see `../rakshita-mobile/README.md`. Working: auth, SOS,
**real shake-to-SOS** (accelerometer), **real Emergency Mode camera
capture** (foreground), contacts, map, reporting, admin, KYC. Voice trigger
and BLE mesh relay are implemented but need a custom Expo dev client to run
(not possible in Expo Go) — fully explained in that README, including
exactly what's real vs. sketched for BLE peripheral advertising.

## Run it

```bash
cd rakshita
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                # edit as needed
python3 app.py
```

Then open **http://localhost:5000**

The SQLite database (`rakshita.db`) is created automatically on first run.
No Twilio account is needed to demo it — SOS alerts and who they'd notify
are printed to the console and saved to the database either way.

To get an admin account: add your email to `ADMIN_EMAILS` in `.env`, then
register/log in with that email — it's auto-promoted.

To try Aadhaar KYC: set `AADHAAR_KYC_ENABLED=true` in `.env`, restart, then
visit `/kyc` (or the mobile KYC screen) and upload a photo of any Aadhaar
QR code — it'll show the fields it could read.

## Project structure

```
rakshita/
  app.py              # web routes, admin, KYC, SOS logic, Twilio fallback
  mobile_api.py         # token-authenticated /api/mobile/* blueprint
  aadhaar_kyc.py         # QR decode + parse (OpenCV, no libzbar needed)
  models.py               # User (+role, api_token, aadhaar), contacts, alerts,
                            # reports, AadhaarKYC
  forms.py
  requirements.txt
  .env.example
  templates/
    base.html, landing.html, register.html, login.html
    dashboard.html, contacts.html, report.html, map.html
    admin.html            # admin/police dashboard
    kyc.html               # Aadhaar QR upload
    _navbar.html
  static/
    css/style.css        # the lavender/rose theme
    js/dashboard.js, js/map.js
```

## Next steps if you want to keep extending it

- Docker Compose + Postgres for production
- pytest suite covering auth, SOS, contacts, incidents, admin, KYC
- Real peripheral-mode BLE advertising for the mesh relay (see
  `rakshita-mobile/src/native/BleBeacon.js` for exactly what's left)
- Background-eligible voice/shake triggers via a native foreground service

