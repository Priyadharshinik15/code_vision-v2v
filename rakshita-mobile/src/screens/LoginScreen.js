import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Field, PrimaryButton, ErrorText } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e) {
      setError(e?.response?.data?.error || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to your safety dashboard.</Text>

        <Field label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Field label="Password" placeholder="Your password" secureTextEntry value={password} onChangeText={setPassword} />

        <ErrorText>{error}</ErrorText>
        <PrimaryButton title="Login" onPress={submit} loading={loading} style={{ marginTop: 8 }} />

        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          New here? <Text style={{ color: colors.purple700, fontWeight: "700" }}>Create an account</Text>
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
