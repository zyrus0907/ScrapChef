import { create } from 'zustand';
import { notificationsApi, AppNotification } from '../api/notifications';

interface NotificationsState {
  items: AppNotification[];
  unread: number;
  isLoading: boolean;
  fetch: () => Promise<void>;
  fetchUnread: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  scan: () => Promise<number>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unread: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const { data } = await notificationsApi.list();
      set({ items: data, unread: data.filter((n) => !n.is_read).length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnread: async () => {
    try {
      const { data } = await notificationsApi.unreadCount();
      set({ unread: data.unread });
    } catch {
      /* non-fatal */
    }
  },

  markRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      set((s) => ({
        items: s.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unread: Math.max(0, s.unread - 1),
      }));
    } catch {
      /* non-fatal */
    }
  },

  markAllRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((s) => ({ items: s.items.map((n) => ({ ...n, is_read: true })), unread: 0 }));
    } catch {
      /* non-fatal */
    }
  },

  scan: async () => {
    try {
      const { data } = await notificationsApi.scan();
      await get().fetch();
      return data.created;
    } catch {
      return 0;
    }
  },
}));
