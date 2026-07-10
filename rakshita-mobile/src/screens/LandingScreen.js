import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import DecorativeBackground from "../components/DecorativeBackground";

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <DecorativeBackground />

      <View style={styles.center}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />

        <Text style={styles.wordmark}>R A K S H I T A</Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.heart}>♥</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.tagline}>Because every woman deserves{"\n"}to feel safe, always.</Text>

        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("Register")} style={styles.gradientWrap}>
          <LinearGradient
            colors={["#c9b8f0", "#9c8ae0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.registerBtn}
          >
            <Text style={styles.registerText}>Register</Text>
            <View style={styles.arrowCircleLight}>
              <Text style={styles.arrowLight}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("Login")} style={styles.loginBtn}>
          <Text style={styles.loginText}>Login</Text>
          <View style={styles.arrowCircleDark}>
            <Text style={styles.arrowDark}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerIcon}>🛡</Text>
          <Text style={styles.footer}>Your Safety. Our Priority.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf6f4" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  logo: { width: 140, height: 112 },

  wordmark: {
    fontSize: 26,
    fontWeight: "600",
    color: "#9c8ae0",
    marginTop: 16,
    letterSpacing: 6,
  },

  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 18, width: 160 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e9b8bc" },
  heart: { color: "#e98d93", fontSize: 14, marginHorizontal: 10 },

  tagline: {
    textAlign: "center",
    color: "#7d7690",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },

  gradientWrap: { width: "100%", borderRadius: 999, shadowColor: "#9c8ae0", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  registerBtn: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  arrowCircleLight: {
    position: "absolute",
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLight: { color: "#fff", fontWeight: "700" },

  orRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: "#e6e1f2" },
  orText: { color: "#a9a3bd", marginHorizontal: 12, fontSize: 14 },

  loginBtn: {
    width: "100%",
    paddingVertical: 17,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e6ddf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { color: "#9c8ae0", fontWeight: "700", fontSize: 17 },
  arrowCircleDark: {
    position: "absolute",
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1ecfb",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDark: { color: "#9c8ae0", fontWeight: "700" },

  footerRow: { flexDirection: "row", alignItems: "center", marginTop: 34 },
  footerIcon: { fontSize: 14, marginRight: 6, opacity: 0.7 },
  footer: { color: "#a9a3bd", fontSize: 13 },
});