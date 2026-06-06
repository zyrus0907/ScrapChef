import { create } from 'zustand';
import {
  shoppingApi,
  ShoppingList,
  RestockSuggestion,
} from '../api/shopping';

interface ShoppingState {
  lists: ShoppingList[];
  suggestions: RestockSuggestion[];
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  createList: (name: string) => Promise<ShoppingList | null>;
  archiveList: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  lists: [],
  suggestions: [],
  isLoading: false,
  error: null,

  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await shoppingApi.lists();
      set({ lists: data, isLoading: false });
    } catch {
      set({ error: 'Failed to load shopping lists.', isLoading: false });
    }
  },

  fetchSuggestions: async () => {
    try {
      const { data } = await shoppingApi.suggestions();
      set({ suggestions: data });
    } catch {
      /* non-fatal */
    }
  },

  createList: async (name) => {
    try {
      const { data } = await shoppingApi.createList(name);
      set((s) => ({ lists: [data, ...s.lists] }));
      return data;
    } catch {
      set({ error: 'Failed to create list.' });
      return null;
    }
  },

  archiveList: async (id) => {
    try {
      await shoppingApi.archiveList(id);
      set((s) => ({ lists: s.lists.filter((l) => l.id !== id) }));
    } catch {
      set({ error: 'Failed to archive list.' });
    }
  },

  clearError: () => set({ error: null }),
}));
