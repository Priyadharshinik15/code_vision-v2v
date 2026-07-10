import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Point this at your Flask server. On a physical device or Expo Go, use your
// machine's LAN IP (e.g. http://10.199.230.142:5000), not localhost — the
// phone can't resolve "localhost" back to your dev machine. Set this via
// EXPO_PUBLIC_API_URL in a .env file rather than editing the fallback below,
// so it doesn't silently drift out of date.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.199.230.142:5000";

const TOKEN_KEY = "rakshita_api_token";

// expo-secure-store has NO web implementation — calling it on web throws.
// Use localStorage on web, SecureStore on native, so token persistence
// (and anything that awaits it, like AuthContext's session check) works
// everywhere instead of hanging or crashing on web.
export const tokenStore = {
  async get() {
    if (Platform.OS === "web") {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token) {
    if (Platform.OS === "web") {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear() {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/mobile`,
  timeout: 12000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Turn an axios error into a message that actually tells the user what
 * happened, instead of a generic "something went wrong" for every failure
 * mode. Network errors (server unreachable) look very different from
 * validation errors (server responded, but rejected the input) — conflating
 * them makes correct input look broken.
 */
export function describeApiError(e) {
  if (e?.response?.data?.error) {
    // Server reached us and rejected the request — a real validation/auth error.
    return e.response.data.error;
  }
  if (e?.request) {
    // Request was sent but no response came back — server unreachable.
    return `Can't reach the server at ${API_BASE_URL}. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly.`;
  }
  return e?.message || "Something went wrong. Try again.";
}

export default api;