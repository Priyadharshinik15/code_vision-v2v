import React from "react";
import { TouchableOpacity, Text, TextInput, View, StyleSheet, ActivityIndicator } from "react-native";
import { colors, radii } from "../theme/colors";

export function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.secondaryBtn, style]} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.outlineBtn, style]} onPress={onPress}>
      <Text style={styles.outlineBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} placeholderTextColor={colors.inkSoft} {...props} />
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <Text style={styles.errorText}>{children}</Text>;
}

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: colors.purple500,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.purple700,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.purple100,
  },
  secondaryBtnText: { color: colors.purple700, fontWeight: "700", fontSize: 16 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.purple300,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  outlineBtnText: { color: colors.purple700, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: colors.purple900, marginBottom: 6 },
  input: {
    backgroundColor: colors.purple100,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
    borderWidth: 1,
    borderColor: "#e6ddf8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: 22,
    shadowColor: colors.purple700,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  errorText: { color: "#d9534f", fontSize: 13, marginTop: 6 },
});
