import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Point this at your Flask server. On a physical device or Expo Go, use your
// machine's LAN IP (e.g. http://192.168.1.20:5000), not localhost — the phone
// can't resolve "localhost" back to your dev machine.
export const API_BASE_URL = "http://10.199.230.142:5000";

const TOKEN_KEY = "rakshita_api_token";

export const tokenStore = {
  async get() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear() {
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

export default api;
