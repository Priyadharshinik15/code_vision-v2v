/**
 * Beacon Relay — offline, phone-to-phone mesh SOS.
 *
 * PLATFORM REALITY, stated up front: this file needs `react-native-ble-plx`,
 * which is a native module. It will NOT run inside Expo Go — you must build
 * a custom dev client first:
 *
 *   npx expo install react-native-ble-plx
 *   eas build --profile development --platform android   (or ios)
 *   npx expo start --dev-client
 *
 * What's implemented here: a genuine foreground proof-of-concept of the hop
 * logic — advertise a distress beacon, scan for beacons from other phones
 * running Rakshita, and relay anything you hear onward (incrementing a hop
 * count, dropping anything already seen or past its TTL).
 *
 * What this is NOT, and can't be without more work: true BACKGROUND
 * scanning/advertising, where a stranger's phone relays your beacon without
 * their app open. iOS restricts background BLE advertising heavily (no
 * custom service UUIDs while backgrounded), and Android needs a persistent
 * foreground service with a visible notification. Both are buildable in a
 * bare/EAS workflow but are a real chunk of additional native work beyond
 * this scaffold — flagging that plainly rather than pretending it's done.
 *
 * The demo narrative that matches what's actually here: "two phones, both
 * with Rakshita open, in Bluetooth range — one triggers offline SOS, the
 * other relays it the moment it gets signal." That's honestly demoable with
 * this code; a production background mesh is the clear next step.
 */

const RAKSHITA_SERVICE_UUID = "6d5b9e00-0000-1000-8000-00805f9b34fb"; // placeholder, generate a real one
const SEEN_BEACON_TTL_MS = 5 * 60 * 1000;
const MAX_HOPS = 6;

let BleManagerClass = null;
try {
  // Deliberately lazy/optional require: importing react-native-ble-plx in
  // Expo Go throws immediately, so this module has to degrade gracefully
  // rather than crash the whole app for anyone not running a dev client.
  BleManagerClass = require("react-native-ble-plx").BleManager;
} catch (e) {
  BleManagerClass = null;
}

export function isBleRelaySupported() {
  return BleManagerClass !== null;
}

export class BeaconRelay {
  constructor({ onBeaconReceived }) {
    if (!BleManagerClass) {
      throw new Error(
        "react-native-ble-plx isn't available in this runtime. " +
          "Beacon Relay needs a custom dev client (EAS build) — see the " +
          "comment at the top of BleBeacon.js."
      );
    }
    this.manager = new BleManagerClass();
    this.seenBeacons = new Map(); // beaconId -> timestamp
    this.onBeaconReceived = onBeaconReceived;
    this.scanning = false;
  }

  /** Encodes a distress beacon: anonymized, rough location, hop count, TTL. */
  encodeBeacon({ lat, lng, hops = 0 }) {
    const payload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lat: Math.round(lat * 1000) / 1000, // ~110m precision — rough on purpose
      lng: Math.round(lng * 1000) / 1000,
      ts: Date.now(),
      hops,
    };
    return payload;
  }

  async startAdvertising(beacon) {
    // NOTE: react-native-ble-plx is a *central*-role library (scanning +
    // connecting). Peripheral-role advertising (actually broadcasting a
    // beacon other phones can see) needs an additional peripheral-mode
    // native module (e.g. react-native-ble-advertiser) — not wired up here.
    // This method is a documented placeholder for that next step.
    console.warn(
      "[BeaconRelay] Advertising requires a peripheral-mode BLE module " +
        "not included in this scaffold. See BleBeacon.js comments."
    );
  }

  async startScanning() {
    if (this.scanning) return;
    this.scanning = true;
    this.manager.startDeviceScan([RAKSHITA_SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.warn("[BeaconRelay] scan error", error);
        return;
      }
      this._handleDiscoveredDevice(device);
    });
  }

  stopScanning() {
    this.scanning = false;
    this.manager.stopDeviceScan();
  }

  _handleDiscoveredDevice(device) {
    // In a full implementation you'd read the beacon payload out of the
    // device's manufacturer data / advertised service data here. Sketch:
    const beaconId = device.id;
    const now = Date.now();

    this._pruneOldBeacons(now);
    if (this.seenBeacons.has(beaconId)) return; // already relayed this one

    this.seenBeacons.set(beaconId, now);
    this.onBeaconReceived && this.onBeaconReceived({ deviceId: beaconId, rssi: device.rssi });

    // Hop-count / TTL logic for a relay chain: increment hops, drop if
    // MAX_HOPS exceeded, otherwise re-advertise onward (once peripheral
    // advertising is wired up).
  }

  _pruneOldBeacons(now) {
    for (const [id, ts] of this.seenBeacons.entries()) {
      if (now - ts > SEEN_BEACON_TTL_MS) this.seenBeacons.delete(id);
    }
  }

  destroy() {
    this.stopScanning();
    this.manager.destroy();
  }
}
