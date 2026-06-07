import { create } from 'zustand';
import { authApi, UserProfile } from '../api/auth';
import { clearTokens, getTokens, setTokens } from '../utils/storage';

// Pull a human-readable message out of an axios error. Handles: no network
// (request never reached the server), our DomainError shape ({error:{message}}),
// and FastAPI validation errors ({detail: string | [{msg}]}).
const errorMessage = (e: any, fallback: string): string => {
  if (e?.response) {
    const data = e.response.data;
    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
      return String(data.detail[0].msg).replace(/^Value error,\s*/, '');
    }
    return fallback;
  }
  // No response object → the request never completed (server unreachable).
  return "Can't reach the server. Make sure the backend is running and the app is pointed at the right address.";
};

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      await setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      const { data: user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: errorMessage(e, 'Login failed. Please check your credentials.'), isLoading: false });
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register(email, password, displayName);
      await setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      const { data: user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: errorMessage(e, 'Registration failed.'), isLoading: false });
    }
  },

  logout: async () => {
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = await getTokens();
      if (!accessToken) {
        set({ isLoading: false });
        return;
      }
      const { data: user } = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
}));
