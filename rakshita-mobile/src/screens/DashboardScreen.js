import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Card, OutlineButton } from "../components/UI";
import EmergencyModeCamera from "../components/EmergencyModeCamera";
import { useShakeDetection } from "../hooks/useShakeDetection";
import { isVoiceTriggerSupported, VoiceTrigger } from "../native/VoiceTrigger";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radii } from "../theme/colors";

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [signal, setSignal] = useState(null);
  const voiceRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [contactsRes] = await Promise.all([api.get("/contacts")]);
      setContactsCount(contactsRes.data.contacts.length);
    } catch (e) {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") throw new Error("Location permission denied.");
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  };

  const triggerSOS = useCallback(
    async (source = "button") => {
      if (sending || activeAlert) return;
      setSending(true);
      try {
        const { latitude, longitude } = await getLocation();
        const res = await api.post("/sos", { latitude, longitude, source });
        setActiveAlert({ id: res.data.alert_id });
        setCameraOpen(true); // Emergency Mode: open camera in foreground per the pipeline
        Alert.alert(
          "SOS sent",
          res.data.notified.length ? `Notified: ${res.data.notified.join(", ")}` : res.data.message
        );
      } catch (e) {
        Alert.alert("Couldn't send SOS", e?.response?.data?.error || e.message || "Check location permissions and try again.");
      } finally {
        setSending(false);
      }
    },
    [sending, activeAlert]
  );

  // Real, working: shake-to-SOS via the accelerometer.
  useShakeDetection(() => triggerSOS("shake"), true);

  // Voice trigger — only active if a custom dev client with
  // @react-native-voice/voice is running (see native/VoiceTrigger.js).
  useEffect(() => {
    if (!isVoiceTriggerSupported()) return;
    voiceRef.current = new VoiceTrigger({ onTrigger: () => triggerSOS("voice") });
    voiceRef.current.start();
    return () => voiceRef.current && voiceRef.current.destroy();
  }, [triggerSOS]);

  const markSafe = async () => {
    if (!activeAlert) return;
    await api.post(`/sos/${activeAlert.id}/resolve`);
    setActiveAlert(null);
  };

  // Live Safety Signal — poll every 8s, same cadence as the web dashboard.
  useEffect(() => {
    let interval;
    (async () => {
      try {
        const { latitude, longitude } = await getLocation();
        interval = setInterval(async () => {
          try {
            const res = await api.get("/danger-alerts/nearby", { params: { latitude, longitude } });
            setSignal(res.data.alerts.length > 0 ? res.data : null);
          } catch (e) {
            /* skip a cycle */
          }
        }, 8000);
      } catch (e) {
        /* location not granted yet — signal just won't populate */
      }
    })();
    return () => interval && clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brand}>RAKSHITA</Text>
            {user?.name ? <Text style={styles.brandSub}>Hi, {user.name}</Text> : null}
          </View>
        </View>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Logout</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {signal && (
          <View style={styles.signalBanner}>
            <Text style={styles.signalText}>
              ⚠ {signal.alerts.length} safety signal(s) within {signal.radius_km} km
            </Text>
          </View>
        )}

        <Card style={{ alignItems: "center" }}>
          <Text style={styles.cardTitle}>Emergency SOS</Text>
          <Text style={styles.cardMuted}>Shake the phone hard 3 times, or tap below.</Text>
          <TouchableOpacity
            style={[styles.sosBtn, activeAlert && styles.sosBtnActive]}
            onPress={() => triggerSOS("button")}
            disabled={sending || !!activeAlert}
          >
            <Text style={styles.sosBtnText}>{activeAlert ? "ACTIVE" : sending ? "..." : "SOS"}</Text>
          </TouchableOpacity>
          {activeAlert && <OutlineButton title="Mark myself safe" onPress={markSafe} style={{ marginTop: 14 }} />}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.cardTitle}>Emergency Contacts</Text>
          <Text style={styles.cardMuted}>{contactsCount} of 5 trusted contacts saved.</Text>
          <OutlineButton title="Manage contacts" onPress={() => navigation.navigate("Contacts")} />
        </Card>

        <View style={styles.row}>
          <Card style={styles.rowCard}>
            <Text style={styles.cardTitle}>Safe Map</Text>
            <OutlineButton title="Open" onPress={() => navigation.navigate("Map")} />
          </Card>
          <Card style={styles.rowCard}>
            <Text style={styles.cardTitle}>Report</Text>
            <OutlineButton title="File" onPress={() => navigation.navigate("Report")} />
          </Card>
        </View>

        {user?.role === "admin" && (
          <Card style={{ marginTop: 16 }}>
            <Text style={styles.cardTitle}>Admin</Text>
            <OutlineButton title="Open admin dashboard" onPress={() => navigation.navigate("Admin")} />
          </Card>
        )}

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.cardTitle}>Aadhaar Verification</Text>
          <Text style={styles.cardMuted}>Optional. Reads the printed QR only — not signature-verified.</Text>
          <OutlineButton title="Go to KYC" onPress={() => navigation.navigate("KYC")} />
        </Card>
      </ScrollView>

      <EmergencyModeCamera
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onFrame={(photo) => {
          // Wire this up to your evidence-upload endpoint / on-device
          // frame analysis. Left as a hook point — see the project README.
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple100,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 34, height: 27 },
  brand: { fontWeight: "700", color: colors.purple900, letterSpacing: 1 },
  brandSub: { fontSize: 11, color: colors.inkSoft, marginTop: 1 },
  logout: { color: colors.inkSoft },
  scroll: { padding: 20, paddingBottom: 60 },
  signalBanner: { backgroundColor: "#fff3e0", borderRadius: radii.md, padding: 14, marginBottom: 16 },
  signalText: { color: "#8a5a1c" },
  cardTitle: { fontWeight: "700", color: colors.purple900, fontSize: 16, marginBottom: 4 },
  cardMuted: { color: colors.inkSoft, fontSize: 13, marginBottom: 14, textAlign: "center" },
  sosBtn: {
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.danger,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 6,
  },
  sosBtnActive: { backgroundColor: colors.dangerDark },
  sosBtnText: { color: "#fff", fontWeight: "800", fontSize: 22 },
  row: { flexDirection: "row", gap: 12, marginTop: 16 },
  rowCard: { flex: 1, alignItems: "center" },
});