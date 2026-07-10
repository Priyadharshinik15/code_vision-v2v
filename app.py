import numpy as np
import sounddevice as sd
import librosa
import random
import time
import joblib
import torch

from transformers import AutoFeatureExtractor, ASTForAudioClassification

# =========================
# LOAD MODELS
# =========================

imu_model = joblib.load("imu_model.pkl")

model_name = "MIT/ast-finetuned-audioset-10-10-0.4593"

feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
audio_model = ASTForAudioClassification.from_pretrained(model_name)

# =========================
# AUDIO INPUT (MIC)
# =========================

def record_audio(duration=3, fs=16000):
    print("🎤 Listening...")

    audio = sd.rec(int(duration * fs),
                   samplerate=fs,
                   channels=1,
                   dtype='float32')

    sd.wait()
    return audio.flatten(), fs

# =========================
# IMU SIMULATION (replace with real sensor later)
# =========================

def get_imu_data():

    acc_x = random.uniform(0, 20)
    acc_y = random.uniform(0, 20)
    acc_z = random.uniform(0, 25)

    gyro_x = random.uniform(0, 10)
    gyro_y = random.uniform(0, 10)
    gyro_z = random.uniform(0, 10)

    speed = random.uniform(0, 90)

    acc_mag = np.sqrt(acc_x**2 + acc_y**2 + acc_z**2)

    imu_data = np.array([[
        acc_x, acc_y, acc_z,
        gyro_x, gyro_y, gyro_z,
        speed, acc_mag
    ]])

    return imu_data

# =========================
# AUDIO PREDICTION (AST)
# =========================

def audio_predict(audio, sr):

    inputs = feature_extractor(audio, sampling_rate=sr, return_tensors="pt")

    with torch.no_grad():
        logits = audio_model(**inputs).logits

    pred_id = torch.argmax(logits).item()

    label = audio_model.config.id2label.get(pred_id, "unknown")

    confidence = torch.softmax(logits, dim=1)[0][pred_id].item()

    return label, confidence

# =========================
# IMU PREDICTION
# =========================

def imu_predict(imu_data):
    probs = imu_model.predict_proba(imu_data)[0]
    return np.max(probs)

# =========================
# 🔥 FUSION ENGINE (CORE LOGIC)
# =========================

def compute_risk(audio_label, audio_conf, imu_prob):

    label = audio_label.lower()

    ACCIDENT_KEYWORDS = [
        "crash", "collision", "impact", "bang",
        "slam", "thud", "skid", "brake"
    ]

    EMERGENCY_KEYWORDS = [
        "siren", "ambulance", "police", "fire"
    ]

    if any(k in label for k in ACCIDENT_KEYWORDS):
        audio_risk = 0.95

    elif any(k in label for k in EMERGENCY_KEYWORDS):
        audio_risk = 0.8

    else:
        audio_risk = 0.2
    # confidence weighting
    audio_risk *= audio_conf

    # FUSION FORMULA (IMPORTANT PART)
    risk_score = (0.6 * imu_prob) + (0.4 * audio_risk)

    return risk_score

# =========================
# DECISION SYSTEM
# =========================

def decision(risk, audio_label):

    print("\n==============================")
    print(f"🎧 Audio Detected: {audio_label}")
    print(f"📊 Risk Score: {risk:.2f}")

    if risk > 0.75:
        print("🚨 HIGH RISK ACCIDENT DETECTED")
        print("➡️ ACTION: SEND ALERT + EMERGENCY NOTIFICATION")

    elif risk > 0.5:
        print("⚠️ MEDIUM RISK EVENT")
        print("➡️ ACTION: MONITOR CLOSELY")

    else:
        print("🟢 SAFE ENVIRONMENT")
        print("➡️ ACTION: NO ALERT")

    print("==============================\n")

# =========================
# MAIN LOOP (REAL TIME SYSTEM)
# =========================

if __name__ == "__main__":

    print("🚀 AIVER FUSION SYSTEM STARTED")

    while True:

        # AUDIO
        audio, sr = record_audio()
        audio_label, audio_conf = audio_predict(audio, sr)

        # IMU
        imu_data = get_imu_data()
        imu_prob = imu_predict(imu_data)

        # FUSION
        risk = compute_risk(audio_label, audio_conf, imu_prob)

        # FINAL DECISION
        decision(risk, audio_label)

        time.sleep(1)