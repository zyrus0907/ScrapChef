import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@sp/dietary';

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Halal',
];

interface PrefsState {
  dietary: string[];
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (pref: string) => void;
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  dietary: [],
  loaded: false,
  load: async () => {
    try {
      const v = await AsyncStorage.getItem(KEY);
      set({ dietary: v ? JSON.parse(v) : [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  toggle: (pref) => {
    const cur = get().dietary;
    const next = cur.includes(pref) ? cur.filter((p) => p !== pref) : [...cur, pref];
    set({ dietary: next });
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  },
}));
