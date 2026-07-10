/**
 * Voice SOS trigger — listens for a wake phrase (e.g. "help me") and fires
 * SOS hands-free.
 *
 * PLATFORM REALITY, same pattern as BleBeacon.js: `@react-native-voice/voice`
 * is a native module and will NOT run inside Expo Go. You need a custom dev
 * client:
 *
 *   npx expo install @react-native-voice/voice
 *   eas build --profile development --platform android   (or ios)
 *   npx expo start --dev-client
 *
 * What's implemented here: continuous speech-to-text while the listener is
 * active, checked against a small set of trigger phrases, foreground only.
 *
 * What this is NOT: an always-on background wake-word detector. Both iOS
 * and Android restrict background microphone access hard, for good privacy
 * reasons — a real "always listening" trigger needs a background audio
 * session (iOS) or a foreground service with a persistent notification
 * (Android), and even then app stores scrutinize always-listening mic
 * access heavily. This module covers "foreground voice trigger," which is
 * honestly what's buildable without a lot more native work.
 */

const TRIGGER_PHRASES = ["help me", "help", "emergency", "sos"];

let Voice = null;
try {
  Voice = require("@react-native-voice/voice").default;
} catch (e) {
  Voice = null;
}

// Importing the JS module always succeeds (it's just JS), even when the
// underlying native module (RCTVoice) isn't linked — which is exactly the
// case in Expo Go. Without a working native module, Voice.start()/.destroy()
// throw "Cannot read property 'startSpeech'/'destroySpeech' of null" instead
// of failing at require() time. So we additionally check for the native
// module itself via NativeModules, and only report "supported" when both
// the JS wrapper AND the native module are actually present.
let NativeVoiceModule = null;
try {
  const { NativeModules } = require("react-native");
  NativeVoiceModule = NativeModules.Voice || null;
} catch (e) {
  NativeVoiceModule = null;
}

export function isVoiceTriggerSupported() {
  return Voice !== null && NativeVoiceModule !== null;
}

export class VoiceTrigger {
  constructor({ onTrigger, phrases = TRIGGER_PHRASES }) {
    if (!isVoiceTriggerSupported()) {
      throw new Error(
        "@react-native-voice/voice isn't available in this runtime " +
          "(native module not linked — expected in Expo Go). " +
          "Voice trigger needs a custom dev client (EAS build) — see the " +
          "comment at the top of VoiceTrigger.js."
      );
    }
    this.onTrigger = onTrigger;
    this.phrases = phrases.map((p) => p.toLowerCase());
    this.listening = false;

    Voice.onSpeechResults = this._handleResults.bind(this);
    Voice.onSpeechError = (e) => console.warn("[VoiceTrigger] speech error", e);
  }

  _handleResults(event) {
    const heard = (event.value || []).join(" ").toLowerCase();
    if (this.phrases.some((p) => heard.includes(p))) {
      this.onTrigger && this.onTrigger(heard);
    }
    // Restart listening — react-native-voice sessions end after each
    // utterance rather than truly streaming continuously.
    if (this.listening) this.start();
  }

  async start() {
    this.listening = true;
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.warn("[VoiceTrigger] failed to start", e);
    }
  }

  async stop() {
    this.listening = false;
    try {
      await Voice.stop();
    } catch (e) {
      // no-op — stopping an already-stopped session is fine to ignore
    }
  }

  destroy() {
    this.stop();
    Voice.destroy()
      .then(Voice.removeAllListeners)
      .catch((e) => console.warn("[VoiceTrigger] failed to destroy", e));
  }
}