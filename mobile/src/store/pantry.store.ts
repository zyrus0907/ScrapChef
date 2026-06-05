import { create } from 'zustand';
import { pantryApi, PantryItem, AddItemPayload } from '../api/pantry';

interface PantryState {
  items: PantryItem[];
  expiringSoon: PantryItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  fetchExpiringSoon: (days?: number) => Promise<void>;
  addItem: (data: AddItemPayload) => Promise<void>;
  consumeItem: (id: string) => Promise<void>;
  wasteItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  expiringSoon: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await pantryApi.list();
      set({ items: data, isLoading: false });
    } catch (e: any) {
      set({ error: 'Failed to load pantry items.', isLoading: false });
    }
  },

  fetchExpiringSoon: async (days = 7) => {
    try {
      const { data } = await pantryApi.expiringSoon(days);
      set({ expiringSoon: data });
    } catch {}
  },

  addItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newItem } = await pantryApi.add(data);
      set((s) => ({ items: [newItem, ...s.items], isLoading: false }));
    } catch (e: any) {
      set({ error: 'Failed to add item.', isLoading: false });
      throw e;
    }
  },

  consumeItem: async (id) => {
    try {
      const { data: updated } = await pantryApi.consume(id);
      set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }));
    } catch (e: any) {
      set({ error: 'Failed to mark as consumed.' });
    }
  },

  wasteItem: async (id) => {
    try {
      const { data: updated } = await pantryApi.waste(id);
      set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }));
    } catch {
      set({ error: 'Failed to mark as wasted.' });
    }
  },

  deleteItem: async (id) => {
    try {
      await pantryApi.delete(id);
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    } catch {
      set({ error: 'Failed to delete item.' });
    }
  },

  clearError: () => set({ error: null }),
}));
