import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DecorativeBackground from "../components/DecorativeBackground";
import { colors } from "../theme/colors";

/**
 * Splash/Loading screen shown while authenticating
 * Displays the same background as LandingScreen with a loading indicator
 */
export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background layer - behind everything */}
      <DecorativeBackground />

      {/* Content layer - centered loading indicator */}
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.purple500} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6f4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
