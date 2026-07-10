import React from "react";
import { View, StyleSheet, Image } from "react-native";

/**
 * Decorative background for the landing screen.
 *
 * Single full-bleed background image (the softer pastel floral design),
 * scaled to cover the whole screen. This is a landscape source image, so
 * "cover" will zoom in somewhat on portrait phones to fill edge-to-edge
 * without letterboxing — the corner motifs (dot grids, leaf sprigs) stay
 * visible since they sit near the actual corners of the source image.
 */
export default function DecorativeBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={require("../../assets/landing-background.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
    </View>
  );
}