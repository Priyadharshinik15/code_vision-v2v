import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Card, Field, PrimaryButton, OutlineButton } from "../components/UI";
import api from "../api/client";
import { colors } from "../theme/colors";

const CATEGORIES = [
  { value: "harassment", label: "Harassment" },
  { value: "stalking", label: "Stalking" },
  { value: "unsafe_area", label: "Unsafe area / poor lighting" },
  { value: "theft", label: "Theft" },
  { value: "assault", label: "Assault" },
  { value: "other", label: "Other" },
];

export default function ReportScreen({ navigation }) {
  const [category, setCategory] = useState("harassment");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const attachLocation = async () => {
    setLocStatus("Getting your location…");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("permission denied");
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocStatus("Location attached ✓");
    } catch (e) {
      setLocStatus("Couldn't get location — you can still submit without it.");
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/incidents", {
        category,
        description,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      Alert.alert("Thanks", "Your report helps keep the community informed.");
      navigation.navigate("Map");
    } catch (e) {
      Alert.alert("Couldn't submit", e?.response?.data?.error || "Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={styles.title}>Report an incident</Text>
          <Text style={styles.muted}>Anonymous to other users — helps build the hotspot map.</Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.categoryChip, category === c.value && styles.categoryChipActive]}
                onPress={() => setCategory(c.value)}
              >
                <Text style={[styles.categoryText, category === c.value && styles.categoryTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field
            label="Description (optional)"
            placeholder="What happened?"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            style={{ height: 100, textAlignVertical: "top" }}
          />

          <OutlineButton title="📍 Attach my current location" onPress={attachLocation} style={{ marginBottom: 8 }} />
          {!!locStatus && <Text style={styles.muted}>{locStatus}</Text>}

          <PrimaryButton title="Submit report" onPress={submit} loading={loading} style={{ marginTop: 14 }} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.purple900, fontSize: 16, marginBottom: 4 },
  muted: { color: colors.inkSoft, fontSize: 13, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "600", color: colors.purple900, marginBottom: 8 },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  categoryChip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    borderWidth: 1, borderColor: colors.purple300,
  },
  categoryChipActive: { backgroundColor: colors.purple500, borderColor: colors.purple500 },
  categoryText: { color: colors.purple700, fontSize: 13 },
  categoryTextActive: { color: "#fff", fontWeight: "700" },
});
