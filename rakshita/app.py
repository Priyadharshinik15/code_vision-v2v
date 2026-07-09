import os
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, render_template, redirect, url_for, flash, request, session, jsonify
from flask_wtf import CSRFProtect
from flask_cors import CORS
from dotenv import load_dotenv
from geopy.distance import geodesic

from models import db, User, EmergencyContact, SOSAlert, IncidentReport, AadhaarKYC
from forms import RegisterForm, LoginForm, ContactForm, ReportForm

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-insecure-key")
basedir = os.path.abspath(os.path.dirname(__file__))
default_db_path = "sqlite:///" + os.path.join(basedir, "rakshita.db")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", default_db_path)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTACTS_PER_USER"] = 5
app.config["NEARBY_RADIUS_KM"] = 2
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8MB, generous for a KYC photo

# Feature flags — off by default, exactly as originally scoped.
AADHAAR_KYC_ENABLED = os.environ.get("AADHAAR_KYC_ENABLED", "false").lower() == "true"
app.config["AADHAAR_KYC_ENABLED"] = AADHAAR_KYC_ENABLED

# Emails in this list are auto-promoted to admin on register/login — the
# simplest possible bootstrap for a hackathon demo. Swap for a real role
# management flow before production.
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}

db.init_app(app)
csrf = CSRFProtect(app)
# Mobile app (Expo/React Native) calls this API from a different origin,
# and authenticates with a bearer token rather than cookies, so CORS is safe
# to open here without weakening the session-based web CSRF protections above.
CORS(app, resources={r"/api/mobile/*": {"origins": "*"}})

app.config["ADMIN_EMAILS"] = ADMIN_EMAILS

from mobile_api import mobile_api  # noqa: E402
app.register_blueprint(mobile_api)
csrf.exempt(mobile_api)  # token-authenticated, not cookie-based — see mobile_api.py docstring

# Optional Twilio — only activates if credentials are present.
TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.environ.get("TWILIO_FROM_NUMBER")
twilio_client = None
if TWILIO_SID and TWILIO_TOKEN:
    try:
        from twilio.rest import Client
        twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)
    except Exception as e:
        print(f"[Rakshita] Twilio not active, falling back to log mode: {e}")


def send_sms(to_number, body):
    """Send a real SMS if Twilio is configured, otherwise log it (demo-safe fallback)."""
    if twilio_client and TWILIO_FROM:
        try:
            twilio_client.messages.create(to=to_number, from_=TWILIO_FROM, body=body)
            return True
        except Exception as e:
            print(f"[Rakshita][SMS FAILED] to={to_number}: {e}")
            return False
    else:
        print(f"[Rakshita][SMS-LOG] to={to_number}: {body}")
        return True


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            flash("Please log in to continue.", "error")
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            flash("Please log in to continue.", "error")
            return redirect(url_for("login"))
        if not user.is_admin():
            flash("That page is for admins only.", "error")
            return redirect(url_for("dashboard"))
        return view(*args, **kwargs)
    return wrapped


def maybe_promote_admin(user):
    if user.email.lower() in ADMIN_EMAILS and user.role != "admin":
        user.role = "admin"
        db.session.commit()


def current_user():
    uid = session.get("user_id")
    return User.query.get(uid) if uid else None


@app.context_processor
def inject_user():
    return {"current_user": current_user(), "aadhaar_kyc_enabled": AADHAAR_KYC_ENABLED}


# ---------- Public pages ----------

@app.route("/")
def landing():
    if session.get("user_id"):
        return redirect(url_for("dashboard"))
    return render_template("landing.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if session.get("user_id"):
        return redirect(url_for("dashboard"))
    form = RegisterForm()
    if form.validate_on_submit():
        existing = User.query.filter_by(email=form.email.data.lower().strip()).first()
        if existing:
            flash("An account with that email already exists.", "error")
            return render_template("register.html", form=form)
        user = User(
            name=form.name.data.strip(),
            email=form.email.data.lower().strip(),
            phone=form.phone.data.strip(),
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        maybe_promote_admin(user)
        session["user_id"] = user.id
        flash("Account created. You're all set.", "success")
        return redirect(url_for("dashboard"))
    return render_template("register.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("user_id"):
        return redirect(url_for("dashboard"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower().strip()).first()
        if user and user.check_password(form.password.data):
            maybe_promote_admin(user)
            session["user_id"] = user.id
            flash(f"Welcome back, {user.name.split()[0]}.", "success")
            return redirect(url_for("dashboard"))
        flash("Incorrect email or password.", "error")
    return render_template("login.html", form=form)


@app.route("/logout")
def logout():
    session.clear()
    flash("You've been logged out.", "success")
    return redirect(url_for("landing"))


# ---------- Dashboard ----------

@app.route("/dashboard")
@login_required
def dashboard():
    user = current_user()
    active_alert = SOSAlert.query.filter_by(user_id=user.id, status="active").first()
    contacts_count = EmergencyContact.query.filter_by(user_id=user.id).count()
    return render_template("dashboard.html", active_alert=active_alert, contacts_count=contacts_count)


# ---------- SOS ----------

@app.route("/api/sos", methods=["POST"])
@login_required
def trigger_sos():
    user = current_user()
    data = request.get_json(silent=True) or {}
    lat, lng = data.get("latitude"), data.get("longitude")
    if lat is None or lng is None:
        return jsonify({"error": "Location is required to send an SOS."}), 400

    alert = SOSAlert(user_id=user.id, latitude=lat, longitude=lng, status="active")
    db.session.add(alert)
    db.session.commit()

    contacts = EmergencyContact.query.filter_by(user_id=user.id).all()
    maps_link = f"https://maps.google.com/?q={lat},{lng}"
    notified = []
    for c in contacts:
        body = (
            f"SOS from {user.name}. They need help now. "
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


@app.route("/api/sos/<int:alert_id>/resolve", methods=["POST"])
@login_required
def resolve_sos(alert_id):
    user = current_user()
    alert = SOSAlert.query.filter_by(id=alert_id, user_id=user.id).first_or_404()
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/danger-alerts/nearby")
@login_required
def nearby_alerts():
    """Live Safety Signal — polled by the dashboard every few seconds."""
    lat = request.args.get("latitude", type=float)
    lng = request.args.get("longitude", type=float)
    if lat is None or lng is None:
        return jsonify({"alerts": []})

    radius_km = app.config["NEARBY_RADIUS_KM"]
    since = datetime.utcnow() - timedelta(hours=6)
    candidates = SOSAlert.query.filter(
        SOSAlert.status == "active",
        SOSAlert.created_at >= since,
        SOSAlert.user_id != session["user_id"],
    ).all()

    nearby = []
    for a in candidates:
        dist = geodesic((lat, lng), (a.latitude, a.longitude)).km
        if dist <= radius_km:
            nearby.append({"id": a.id, "distance_km": round(dist, 2), "created_at": a.created_at.isoformat()})

    open_reports = IncidentReport.query.filter(
        IncidentReport.status == "open",
        IncidentReport.created_at >= since,
        IncidentReport.latitude.isnot(None),
    ).all()
    for r in open_reports:
        dist = geodesic((lat, lng), (r.latitude, r.longitude)).km
        if dist <= radius_km:
            nearby.append({"id": f"report-{r.id}", "distance_km": round(dist, 2), "category": r.category})

    return jsonify({"alerts": nearby, "radius_km": radius_km})


# ---------- Emergency contacts ----------

@app.route("/contacts", methods=["GET", "POST"])
@login_required
def contacts():
    user = current_user()
    form = ContactForm()
    existing = EmergencyContact.query.filter_by(user_id=user.id).all()

    if form.validate_on_submit():
        if len(existing) >= app.config["MAX_CONTACTS_PER_USER"]:
            flash(f"You can save up to {app.config['MAX_CONTACTS_PER_USER']} contacts.", "error")
        else:
            c = EmergencyContact(
                user_id=user.id,
                name=form.name.data.strip(),
                phone=form.phone.data.strip(),
                relation=form.relation.data.strip() if form.relation.data else None,
            )
            db.session.add(c)
            db.session.commit()
            flash("Contact added.", "success")
            return redirect(url_for("contacts"))

    return render_template("contacts.html", form=form, contacts=existing,
                            max_contacts=app.config["MAX_CONTACTS_PER_USER"])


@app.route("/contacts/<int:contact_id>/delete", methods=["POST"])
@login_required
def delete_contact(contact_id):
    user = current_user()
    c = EmergencyContact.query.filter_by(id=contact_id, user_id=user.id).first_or_404()
    db.session.delete(c)
    db.session.commit()
    flash("Contact removed.", "success")
    return redirect(url_for("contacts"))


# ---------- Community incident reporting ----------

@app.route("/report", methods=["GET", "POST"])
@login_required
def report_incident():
    form = ReportForm()
    if form.validate_on_submit():
        r = IncidentReport(
            user_id=current_user().id,
            category=form.category.data,
            description=form.description.data,
            latitude=form.latitude.data,
            longitude=form.longitude.data,
        )
        db.session.add(r)
        db.session.commit()
        flash("Thanks — your report helps keep the community informed.", "success")
        return redirect(url_for("incident_map"))
    return render_template("report.html", form=form)


@app.route("/map")
@login_required
def incident_map():
    return render_template("map.html")


@app.route("/api/incidents")
@login_required
def api_incidents():
    since = datetime.utcnow() - timedelta(days=30)
    reports = IncidentReport.query.filter(
        IncidentReport.created_at >= since,
        IncidentReport.latitude.isnot(None),
    ).order_by(IncidentReport.created_at.desc()).all()
    return jsonify({
        "incidents": [
            {
                "id": r.id,
                "category": r.category,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "created_at": r.created_at.isoformat(),
                "status": r.status,
            }
            for r in reports
        ]
    })


@app.route("/api/incidents/summary")
@login_required
def api_incidents_summary():
    reports = IncidentReport.query.all()
    counts = {}
    for r in reports:
        counts[r.category] = counts.get(r.category, 0) + 1
    return jsonify(counts)


# ---------- Admin / Police Dashboard ----------

@app.route("/admin")
@admin_required
def admin_dashboard():
    status_filter = request.args.get("status", "")
    category_filter = request.args.get("category", "")

    reports_q = IncidentReport.query
    if status_filter:
        reports_q = reports_q.filter_by(status=status_filter)
    if category_filter:
        reports_q = reports_q.filter_by(category=category_filter)
    reports = reports_q.order_by(IncidentReport.created_at.desc()).all()

    active_alerts = SOSAlert.query.filter_by(status="active").order_by(SOSAlert.created_at.desc()).all()

    stats = {
        "total_reports": IncidentReport.query.count(),
        "open_reports": IncidentReport.query.filter_by(status="open").count(),
        "active_alerts": SOSAlert.query.filter_by(status="active").count(),
        "total_users": User.query.count(),
    }

    return render_template(
        "admin.html",
        reports=reports,
        active_alerts=active_alerts,
        stats=stats,
        status_filter=status_filter,
        category_filter=category_filter,
    )


@app.route("/admin/reports/<int:report_id>/update", methods=["POST"])
@admin_required
def admin_update_report(report_id):
    r = IncidentReport.query.get_or_404(report_id)
    new_status = request.form.get("status")
    if new_status in ("open", "reviewing", "resolved"):
        r.status = new_status
        db.session.commit()
        flash("Report status updated.", "success")
    return redirect(url_for("admin_dashboard"))


@app.route("/admin/reports/<int:report_id>/delete", methods=["POST"])
@admin_required
def admin_delete_report(report_id):
    r = IncidentReport.query.get_or_404(report_id)
    db.session.delete(r)
    db.session.commit()
    flash("Report deleted.", "success")
    return redirect(url_for("admin_dashboard"))


# ---------- Aadhaar KYC (opt-in, feature-flagged) ----------

@app.route("/kyc", methods=["GET", "POST"])
@login_required
def aadhaar_kyc():
    if not AADHAAR_KYC_ENABLED:
        flash("Aadhaar verification isn't enabled on this deployment.", "error")
        return redirect(url_for("dashboard"))

    user = current_user()
    records = AadhaarKYC.query.filter_by(user_id=user.id).order_by(AadhaarKYC.created_at.desc()).all()

    if request.method == "POST":
        file = request.files.get("qr_image")
        if not file or file.filename == "":
            flash("Please choose an image of the Aadhaar QR code.", "error")
            return redirect(url_for("aadhaar_kyc"))

        from aadhaar_kyc import process_aadhaar_image
        status, raw_text, parsed = process_aadhaar_image(file.read())

        record = AadhaarKYC(
            user_id=user.id,
            raw_payload=raw_text,
            parsed_name=parsed.get("name"),
            parsed_gender=parsed.get("gender"),
            parsed_yob=parsed.get("yob"),
            parsed_pincode=parsed.get("pincode"),
            status=status,
        )
        db.session.add(record)
        if status == "parsed":
            user.aadhaar_verified = True
        db.session.commit()

        flash(
            "QR read successfully — details captured below."
            if status == "parsed"
            else "Couldn't read a valid Aadhaar QR from that image. Try a clearer, well-lit photo.",
            "success" if status == "parsed" else "error",
        )
        return redirect(url_for("aadhaar_kyc"))

    return render_template("kyc.html", records=records)


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
