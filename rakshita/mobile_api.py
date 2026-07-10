"""
Mobile API — everything the React Native app talks to.

Auth model: unlike the web app (server-side session cookie), the mobile
app authenticates with a bearer token issued at login/register and sent
as `Authorization: Bearer <token>` on every request. This is the standard
pattern for a mobile client that isn't a browser and doesn't want to deal
with cookie jars.

CSRF protection is intentionally NOT applied to this blueprint (it's
exempted in app.py) because CSRF defends against a browser silently
attaching a *cookie* to a forged request — a bearer token in a header
isn't attached automatically by anything, so the same attack doesn't apply.
"""
from datetime import datetime, timedelta
from functools import wraps

from flask import Blueprint, request, jsonify, current_app
from geopy.distance import geodesic

from models import db, User, EmergencyContact, SOSAlert, IncidentReport, AadhaarKYC

mobile_api = Blueprint("mobile_api", __name__, url_prefix="/api/mobile")


def get_bearer_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    if not token:
        return None
    return User.query.filter_by(api_token=token).first()


def token_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = get_bearer_user()
        if not user:
            return jsonify({"error": "Missing or invalid token."}), 401
        request.mobile_user = user
        return view(*args, **kwargs)
    return wrapped


def admin_token_required(view):
    @wraps(view)
    @token_required
    def wrapped(*args, **kwargs):
        if not request.mobile_user.is_admin():
            return jsonify({"error": "Admin access required."}), 403
        return view(*args, **kwargs)
    return wrapped


# ---------- Auth ----------

@mobile_api.route("/register", methods=["POST"])
def m_register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not (name and email and phone and len(password) >= 6):
        return jsonify({"error": "name, email, phone, and a 6+ char password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists."}), 409

    user = User(name=name, email=email, phone=phone)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    admin_emails = current_app.config.get("ADMIN_EMAILS", set())
    if email in admin_emails:
        user.role = "admin"
    user.ensure_api_token()
    db.session.commit()

    return jsonify({"token": user.api_token, "user": user.to_public_dict()}), 201


@mobile_api.route("/login", methods=["POST"])
def m_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Incorrect email or password."}), 401

    admin_emails = current_app.config.get("ADMIN_EMAILS", set())
    if email in admin_emails and user.role != "admin":
        user.role = "admin"
    user.ensure_api_token()
    db.session.commit()

    return jsonify({"token": user.api_token, "user": user.to_public_dict()})


@mobile_api.route("/me")
@token_required
def m_me():
    return jsonify({"user": request.mobile_user.to_public_dict()})


# ---------- SOS ----------

@mobile_api.route("/sos", methods=["POST"])
@token_required
def m_trigger_sos():
    user = request.mobile_user
    data = request.get_json(silent=True) or {}
    lat, lng = data.get("latitude"), data.get("longitude")
    source = data.get("source", "button")  # button | shake | voice | ble_relay
    if lat is None or lng is None:
        return jsonify({"error": "Location is required to send an SOS."}), 400

    alert = SOSAlert(user_id=user.id, latitude=lat, longitude=lng, status="active", source=source)
    db.session.add(alert)
    db.session.commit()

    from app import send_sms  # reuse the same Twilio-or-log sender

    contacts = EmergencyContact.query.filter_by(user_id=user.id).all()
    maps_link = f"https://maps.google.com/?q={lat},{lng}"
    notified = []
    for c in contacts:
        body = (
            f"SOS from {user.name} (via {source}). "
            f"Live location: {maps_link} (sent {datetime.utcnow().strftime('%H:%M UTC')})"
        )
        if send_sms(c.phone, body):
            notified.append(c.name)

    alert.notified_contacts = ", ".join(notified) if notified else "no contacts on file"
    db.session.commit()

    return jsonify({
        "ok": True,
        "alert_id": alert.id,
        "notified": notified,
        "message": "SOS sent." if notified else "SOS logged — add emergency contacts to notify someone.",
    })


@mobile_api.route("/sos/<int:alert_id>/resolve", methods=["POST"])
@token_required
def m_resolve_sos(alert_id):
    alert = SOSAlert.query.filter_by(id=alert_id, user_id=request.mobile_user.id).first_or_404()
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"ok": True})


@mobile_api.route("/danger-alerts/nearby")
@token_required
def m_nearby_alerts():
    lat = request.args.get("latitude", type=float)
    lng = request.args.get("longitude", type=float)
    if lat is None or lng is None:
        return jsonify({"alerts": []})

    radius_km = current_app.config["NEARBY_RADIUS_KM"]
    since = datetime.utcnow() - timedelta(hours=6)
    candidates = SOSAlert.query.filter(
        SOSAlert.status == "active",
        SOSAlert.created_at >= since,
        SOSAlert.user_id != request.mobile_user.id,
    ).all()

    nearby = []
    for a in candidates:
        dist = geodesic((lat, lng), (a.latitude, a.longitude)).km
        if dist <= radius_km:
            nearby.append({"id": a.id, "distance_km": round(dist, 2), "created_at": a.created_at.isoformat()})

    return jsonify({"alerts": nearby, "radius_km": radius_km})


# ---------- Emergency contacts ----------

@mobile_api.route("/contacts", methods=["GET", "POST"])
@token_required
def m_contacts():
    user = request.mobile_user
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        existing_count = EmergencyContact.query.filter_by(user_id=user.id).count()
        if existing_count >= current_app.config["MAX_CONTACTS_PER_USER"]:
            return jsonify({"error": "Contact limit reached."}), 400
        name, phone = (data.get("name") or "").strip(), (data.get("phone") or "").strip()
        if not name or not phone:
            return jsonify({"error": "name and phone are required."}), 400
        c = EmergencyContact(user_id=user.id, name=name, phone=phone, relation=data.get("relation"))
        db.session.add(c)
        db.session.commit()

    contacts = EmergencyContact.query.filter_by(user_id=user.id).all()
    return jsonify({
        "contacts": [
            {"id": c.id, "name": c.name, "phone": c.phone, "relation": c.relation}
            for c in contacts
        ]
    })


@mobile_api.route("/contacts/<int:contact_id>", methods=["DELETE"])
@token_required
def m_delete_contact(contact_id):
    c = EmergencyContact.query.filter_by(id=contact_id, user_id=request.mobile_user.id).first_or_404()
    db.session.delete(c)
    db.session.commit()
    return jsonify({"ok": True})


# ---------- Incidents ----------

@mobile_api.route("/incidents", methods=["GET", "POST"])
@token_required
def m_incidents():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        category = data.get("category")
        if category not in ("harassment", "stalking", "unsafe_area", "theft", "assault", "other"):
            return jsonify({"error": "Invalid category."}), 400
        r = IncidentReport(
            user_id=request.mobile_user.id,
            category=category,
            description=data.get("description"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
        )
        db.session.add(r)
        db.session.commit()
        return jsonify({"ok": True, "id": r.id}), 201

    since = datetime.utcnow() - timedelta(days=30)
    reports = IncidentReport.query.filter(
        IncidentReport.created_at >= since,
        IncidentReport.latitude.isnot(None),
    ).order_by(IncidentReport.created_at.desc()).all()
    return jsonify({
        "incidents": [
            {
                "id": r.id, "category": r.category, "latitude": r.latitude,
                "longitude": r.longitude, "created_at": r.created_at.isoformat(), "status": r.status,
            }
            for r in reports
        ]
    })


@mobile_api.route("/incidents/summary")
@token_required
def m_incidents_summary():
    reports = IncidentReport.query.all()
    counts = {}
    for r in reports:
        counts[r.category] = counts.get(r.category, 0) + 1
    return jsonify(counts)


# ---------- Aadhaar KYC ----------

@mobile_api.route("/kyc/upload", methods=["POST"])
@token_required
def m_kyc_upload():
    if not current_app.config.get("AADHAAR_KYC_ENABLED"):
        return jsonify({"error": "Aadhaar verification isn't enabled on this deployment."}), 403

    file = request.files.get("qr_image")
    if not file:
        return jsonify({"error": "qr_image file is required."}), 400

    from aadhaar_kyc import process_aadhaar_image
    status, raw_text, parsed = process_aadhaar_image(file.read())

    user = request.mobile_user
    record = AadhaarKYC(
        user_id=user.id, raw_payload=raw_text, parsed_name=parsed.get("name"),
        parsed_gender=parsed.get("gender"), parsed_yob=parsed.get("yob"),
        parsed_pincode=parsed.get("pincode"), status=status,
    )
    db.session.add(record)
    if status == "parsed":
        user.aadhaar_verified = True
    db.session.commit()

    return jsonify({"status": status, "parsed": parsed})


# ---------- Admin ----------

@mobile_api.route("/admin/reports")
@admin_token_required
def m_admin_reports():
    status_filter = request.args.get("status")
    q = IncidentReport.query
    if status_filter:
        q = q.filter_by(status=status_filter)
    reports = q.order_by(IncidentReport.created_at.desc()).all()
    return jsonify({
        "reports": [
            {
                "id": r.id, "category": r.category, "description": r.description,
                "latitude": r.latitude, "longitude": r.longitude, "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ]
    })


@mobile_api.route("/admin/reports/<int:report_id>", methods=["PATCH", "DELETE"])
@admin_token_required
def m_admin_report_detail(report_id):
    r = IncidentReport.query.get_or_404(report_id)
    if request.method == "DELETE":
        db.session.delete(r)
        db.session.commit()
        return jsonify({"ok": True})

    data = request.get_json(silent=True) or {}
    if data.get("status") in ("open", "reviewing", "resolved"):
        r.status = data["status"]
        db.session.commit()
    return jsonify({"ok": True})


@mobile_api.route("/admin/stats")
@admin_token_required
def m_admin_stats():
    return jsonify({
        "total_reports": IncidentReport.query.count(),
        "open_reports": IncidentReport.query.filter_by(status="open").count(),
        "active_alerts": SOSAlert.query.filter_by(status="active").count(),
        "total_users": User.query.count(),
    })
