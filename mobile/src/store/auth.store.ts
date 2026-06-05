import { create } from 'zustand';
import { authApi, UserProfile } from '../api/auth';
import { clearTokens, getTokens, setTokens } from '../utils/storage';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
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
      const msg = e.response?.data?.detail ?? 'Login failed. Please check your credentials.';
      set({ error: typeof msg === 'string' ? msg : 'Login failed.', isLoading: false });
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
      const msg = e.response?.data?.detail ?? 'Registration failed.';
      set({ error: typeof msg === 'string' ? msg : 'Registration failed.', isLoading: false });
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

  clearError: () => set({ error: null }),
}));
