import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { getTokens, setTokens, clearTokens } from '../utils/storage';

// Override with EXPO_PUBLIC_API_URL (e.g. http://192.168.0.104:8000/api/v1) —
// required when running on a physical phone via Expo Go, where localhost and
// 10.0.2.2 don't reach your dev machine. Otherwise use platform defaults:
// web/iOS sim → localhost, Android emulator → 10.0.2.2.
const getBaseUrl = () => {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api/v1';
  return 'http://localhost:8000/api/v1';
};

export const BASE_URL = getBaseUrl();

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then(
          (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return client(original);
          }
        );
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { refreshToken } = await getTokens();
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        await setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return client(original);
      } catch (e) {
        processQueue(e, null);
        await clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
