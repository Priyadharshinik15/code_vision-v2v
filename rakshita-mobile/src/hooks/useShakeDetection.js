import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

/**
 * Fires `onShake` when the phone is shaken hard enough, hard enough times,
 * within a short window — the same "sum of jerk over a rolling window"
 * approach most shake-to-report/shake-to-SOS apps use.
 *
 * This works today, in Expo Go, with no native build required — accelerometer
 * access doesn't need a custom dev client, unlike BLE or voice.
 *
 * Real limitation worth stating plainly: like the web app's DeviceMotion
 * listener, this only runs while the app is in the foreground. True
 * background shake detection needs a native foreground service
 * (see native/README.md).
 */
const SHAKE_THRESHOLD = 1.8; // g-force delta considered "a shake"
const SHAKES_NEEDED = 3;
const WINDOW_MS = 1500;

export function useShakeDetection(onShake, enabled = true) {
  const shakeTimestamps = useRef([]);
  const lastMagnitude = useRef(1);
  const subscription = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100);
    subscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(magnitude - lastMagnitude.current);
      lastMagnitude.current = magnitude;

      if (delta > SHAKE_THRESHOLD) {
        const now = Date.now();
        shakeTimestamps.current = [...shakeTimestamps.current, now].filter(
          (t) => now - t < WINDOW_MS
        );
        if (shakeTimestamps.current.length >= SHAKES_NEEDED) {
          shakeTimestamps.current = [];
          onShake();
        }
      }
    });

    return () => {
      subscription.current && subscription.current.remove();
    };
  }, [enabled, onShake]);
}
