import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radii } from "../theme/colors";

/**
 * Emergency Mode capture: opens the camera and grabs still frames every
 * couple of seconds while the modal is open, handing each frame to
 * `onFrame` (e.g. to upload as evidence, or run through frame analysis).
 *
 * Honest limitation, same as the web build: this only works while the
 * screen is open and the app is in the foreground. Neither iOS nor Android
 * allow a background app to silently open the camera — that's a deliberate
 * OS privacy protection, not something a native rewrite removes.
 */
export default function EmergencyModeCamera({ visible, onClose, onFrame }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  const startCapturing = () => {
    intervalRef.current = setInterval(async () => {
      if (!cameraRef.current) return;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.4,
          skipProcessing: true,
        });
        onFrame && onFrame(photo);
      } catch (e) {
        // Camera not ready yet on this tick — safe to ignore and retry.
      }
    }, 2500);
  };

  const stopCapturing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  if (!visible) return null;

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible transparent>
        <View style={styles.permissionWrap}>
          <Text style={styles.permissionText}>
            Rakshita needs camera access to capture evidence in Emergency Mode.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Allow camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 14 }}>
            <Text style={{ color: colors.inkSoft }}>Not now</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" onShow={startCapturing} onDismiss={stopCapturing}>
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
          <View style={styles.overlay}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>EMERGENCY MODE — capturing evidence</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flipBtn}
              onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
            >
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => {
                stopCapturing();
                onClose();
              }}
            >
              <Text style={styles.stopText}>Stop &amp; Close</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionWrap: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  permissionText: { textAlign: "center", color: colors.ink, marginBottom: 20, fontSize: 16 },
  permissionBtn: {
    backgroundColor: colors.purple500,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  permissionBtnText: { color: "#fff", fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger },
  recText: { color: "#fff", fontWeight: "700", backgroundColor: "rgba(0,0,0,0.35)", padding: 6, borderRadius: 8 },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flipBtn: { backgroundColor: "rgba(255,255,255,0.85)", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 },
  flipText: { color: colors.purple900, fontWeight: "700" },
  stopBtn: { backgroundColor: colors.danger, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 },
  stopText: { color: "#fff", fontWeight: "700" },
});
