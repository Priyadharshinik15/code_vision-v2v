import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RakshitaLogo from "../components/RakshitaLogo";
import { PrimaryButton, SecondaryButton } from "../components/UI";
import { colors } from "../theme/colors";

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <RakshitaLogo size={130} />
        <Text style={styles.wordmark}>R A K S H I T A</Text>
        <Text style={styles.heart}>♡</Text>
        <Text style={styles.tagline}>Because every woman deserves{"\n"}to feel safe, always.</Text>

        <PrimaryButton title="Register →" onPress={() => navigation.navigate("Register")} style={{ width: "100%", marginTop: 10 }} />
        <Text style={styles.or}>or</Text>
        <SecondaryButton title="Login →" onPress={() => navigation.navigate("Login")} style={{ width: "100%" }} />

        <Text style={styles.footer}>🛡  Your Safety. Our Priority.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  wordmark: { fontSize: 26, fontWeight: "700", color: colors.purple700, marginTop: 14, letterSpacing: 2 },
  heart: { color: colors.pink400, fontSize: 18, marginVertical: 10 },
  tagline: { textAlign: "center", color: colors.inkSoft, fontSize: 16, lineHeight: 22, marginBottom: 28 },
  or: { color: colors.inkSoft, marginVertical: 14 },
  footer: { marginTop: 30, color: colors.inkSoft, fontSize: 13 },
});
