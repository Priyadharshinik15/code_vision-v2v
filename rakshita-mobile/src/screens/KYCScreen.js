import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Card, PrimaryButton, OutlineButton } from "../components/UI";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function KYCScreen() {
  const { user, setUser } = useAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo library access is required to select the QR image.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const upload = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("qr_image", {
        uri: image.uri,
        name: "qr.jpg",
        type: "image/jpeg",
      });
      const res = await api.post("/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      if (res.data.status === "parsed") {
        setUser({ ...user, aadhaar_verified: true });
      }
    } catch (e) {
      Alert.alert("Couldn't process", e?.response?.data?.error || "Try a clearer photo of the QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={styles.title}>Aadhaar verification</Text>
          <Text style={styles.muted}>
            Optional. This reads the printed QR only — it does not verify UIDAI's
            digital signature, so treat it as a convenience check, not legal proof
            of identity.
          </Text>

          {user?.aadhaar_verified && <Text style={styles.verifiedBadge}>✓ QR verified on file</Text>}

          {image && <Image source={{ uri: image.uri }} style={{ width: "100%", height: 200, borderRadius: 14, marginBottom: 14 }} resizeMode="contain" />}

          <OutlineButton title="Choose QR photo" onPress={pickImage} style={{ marginBottom: 12 }} />
          <PrimaryButton title="Upload & read QR" onPress={upload} loading={loading} disabled={!image} />

          {result && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.resultLabel}>Status: {result.status}</Text>
              {result.parsed?.name && <Text style={styles.resultLine}>Name: {result.parsed.name}</Text>}
              {result.parsed?.gender && <Text style={styles.resultLine}>Gender: {result.parsed.gender}</Text>}
              {result.parsed?.yob && <Text style={styles.resultLine}>YOB: {result.parsed.yob}</Text>}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.purple900, fontSize: 16, marginBottom: 6 },
  muted: { color: colors.inkSoft, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  verifiedBadge: { color: colors.success, fontWeight: "700", marginBottom: 12 },
  resultLabel: { fontWeight: "700", color: colors.ink, marginBottom: 4 },
  resultLine: { color: colors.inkSoft, fontSize: 13 },
});
