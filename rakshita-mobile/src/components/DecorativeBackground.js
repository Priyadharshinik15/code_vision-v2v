import React from "react";
import { View, StyleSheet, Image } from "react-native";

/**
 * Decorative background for the landing screen: soft color blobs in each
 * corner, a dotted grid accent, and the real leaf watermark image —
 * approximating the reference design.
 */

function DotGrid({ color = "rgba(255,255,255,0.6)", rows = 3, cols = 3 }) {
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: cols }).map((_, c) => (
        <View key={c} style={{ marginRight: 10 }}>
          {Array.from({ length: rows }).map((_, r) => (
            <View
              key={r}
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: color,
                marginBottom: 10,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function DecorativeBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top-left purple blob with dot grid */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={styles.dotsTopLeft}>
        <DotGrid color="rgba(255,255,255,0.55)" />
      </View>

      {/* Top-right: real leaf watermark image */}
      <Image
        source={require("../../assets/leaf-watermark-2.png")}
        style={styles.leafTopRight}
        resizeMode="cover"
      />

      {/* Bottom-left: real leaf watermark image, flipped */}
      <Image
        source={require("../../assets/leaf-watermark-2.png")}
        style={styles.leafBottomLeft}
        resizeMode="cover"
      />

      {/* Bottom-right pink blob with dot grid */}
      <View style={[styles.blob, styles.blobBottomRight]} />
      <View style={styles.dotsBottomRight}>
        <DotGrid color="rgba(240,168,173,0.5)" />
      </View>
    </View>
  );
}

const BLOB_SIZE = 260;

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    opacity: 0.35,
  },
  blobTopLeft: {
    top: -90,
    left: -110,
    backgroundColor: "#c9b8f0",
    borderBottomRightRadius: BLOB_SIZE * 0.9,
  },
  blobBottomRight: {
    bottom: -110,
    right: -100,
    backgroundColor: "#f7c9cc",
    borderTopLeftRadius: BLOB_SIZE * 0.9,
  },
  dotsTopLeft: { position: "absolute", top: 40, left: 24 },
  dotsBottomRight: { position: "absolute", bottom: 40, right: 24 },
  leafTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 160,
    height: 140,
    opacity: 0.85,
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 170,
    height: 220,
    opacity: 0.85,
    transform: [{ rotate: "180deg" }],
  },
});