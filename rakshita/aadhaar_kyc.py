"""
Aadhaar Secure QR intake — demo-grade only.

What this actually does:
  1. Reads an uploaded image (photo of the physical Aadhaar card or a QR crop).
  2. Uses OpenCV's built-in QR detector (no extra system deps like libzbar).
  3. Tries to parse the decoded text as the older Aadhaar QR XML format
     (`<PrintLetterBarcodeData uid="..." name="..." gender="M" .../>`).

What this deliberately does NOT do:
  - It does not verify UIDAI's digital signature on the newer "Secure QR"
    format (that format is a signed, compressed binary blob — verifying it
    requires UIDAI's public key and is out of scope for a hackathon build).
  - It is therefore not legal identity verification. Treat a "parsed" result
    as "the card's printed QR was readable," not "this person is verified."

This mirrors the same honesty pattern used elsewhere in this project: build
what's real, flag the gap plainly, don't dress up a partial implementation
as the full thing.
"""
import io
import xml.etree.ElementTree as ET

import cv2
import numpy as np


def decode_qr_from_bytes(image_bytes):
    """Returns the raw decoded string from a QR code in the image, or None."""
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    detector = cv2.QRCodeDetector()
    data, points, _ = detector.detectAndDecode(img)
    return data or None


def parse_aadhaar_payload(raw_text):
    """
    Attempts to parse the older plain-XML Aadhaar QR format.
    Returns a dict with whatever fields were found; empty dict if unparsable.
    """
    if not raw_text:
        return {}
    try:
        root = ET.fromstring(raw_text)
        attrs = root.attrib
        return {
            "name": attrs.get("name"),
            "gender": attrs.get("gender"),
            "yob": attrs.get("yob") or attrs.get("dob"),
            "pincode": attrs.get("pc"),
        }
    except ET.ParseError:
        return {}


def process_aadhaar_image(image_bytes):
    """
    Full pipeline: decode QR, attempt parse.
    Returns (status, raw_text, parsed_dict) where status is
    'parsed' | 'unreadable'.
    """
    raw_text = decode_qr_from_bytes(image_bytes)
    if not raw_text:
        return "unreadable", None, {}
    parsed = parse_aadhaar_payload(raw_text)
    status = "parsed" if parsed.get("name") else "unreadable"
    return status, raw_text, parsed
