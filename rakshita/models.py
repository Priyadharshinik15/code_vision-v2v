from datetime import datetime
import secrets
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default="user")  # user | admin
    api_token = db.Column(db.String(64), unique=True, index=True)  # for the React Native app
    aadhaar_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    contacts = db.relationship("EmergencyContact", backref="user", cascade="all, delete-orphan")
    alerts = db.relationship("SOSAlert", backref="user", cascade="all, delete-orphan")
    reports = db.relationship("IncidentReport", backref="user", cascade="all, delete-orphan")
    kyc_records = db.relationship("AadhaarKYC", backref="user", cascade="all, delete-orphan")

    def set_password(self, raw):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw):
        return check_password_hash(self.password_hash, raw)

    def is_admin(self):
        return self.role == "admin"

    def ensure_api_token(self):
        if not self.api_token:
            self.api_token = secrets.token_hex(32)
        return self.api_token

    def to_public_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "aadhaar_verified": self.aadhaar_verified,
        }


class EmergencyContact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    relation = db.Column(db.String(60))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SOSAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="active")  # active | resolved
    source = db.Column(db.String(20), default="button")  # button | shake | voice | ble_relay
    notified_contacts = db.Column(db.Text)  # comma separated names, for the demo log
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)


class IncidentReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    category = db.Column(db.String(60), nullable=False)
    description = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(20), default="open")  # open | reviewing | resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AadhaarKYC(db.Model):
    """
    Demo-grade Aadhaar QR intake — decodes the QR payload for display only.
    IMPORTANT: this does NOT verify the UIDAI cryptographic signature on the
    secure QR, so it must never be treated as legal identity proof. It's an
    opt-in, feature-flagged convenience layer, exactly as scoped originally.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    raw_payload = db.Column(db.Text)  # decoded QR text, kept for manual review
    parsed_name = db.Column(db.String(120))
    parsed_gender = db.Column(db.String(10))
    parsed_yob = db.Column(db.String(10))
    parsed_pincode = db.Column(db.String(10))
    status = db.Column(db.String(20), default="pending")  # pending | parsed | unreadable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
