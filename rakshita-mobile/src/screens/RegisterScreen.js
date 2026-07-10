import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Field, PrimaryButton, ErrorText } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      // Navigation to Dashboard happens automatically via the auth-aware
      // root navigator once `user` is set.
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Rakshita and stay protected, always.</Text>

        <Field label="Full name" placeholder="Your full name" value={form.name} onChangeText={set("name")} />
        <Field label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set("email")} />
        <Field label="Phone number" placeholder="+91 9XXXXXXXXX" keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} />
        <Field label="Password" placeholder="At least 6 characters" secureTextEntry value={form.password} onChangeText={set("password")} />
        <Field label="Confirm password" placeholder="Re-enter password" secureTextEntry value={form.confirm} onChangeText={set("confirm")} />

        <ErrorText>{error}</ErrorText>
        <PrimaryButton title="Register" onPress={submit} loading={loading} style={{ marginTop: 8 }} />

        <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
          Already have an account? <Text style={{ color: colors.purple700, fontWeight: "700" }}>Login</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 28, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: "700", color: colors.purple900, marginBottom: 4 },
  subtitle: { color: colors.inkSoft, marginBottom: 24 },
  link: { textAlign: "center", marginTop: 20, color: colors.inkSoft },
});
