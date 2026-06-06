import client from './client';

export interface AppNotification {
  id: string;
  type: 'expiring_soon' | 'expired' | 'general' | string;
  title: string;
  body: string;
  related_item_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: (unreadOnly = false, limit = 50) =>
    client.get<AppNotification[]>('/notifications', {
      params: { unread_only: unreadOnly, limit },
    }),
  unreadCount: () => client.get<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) => client.post(`/notifications/${id}/read`),
  markAllRead: () => client.post<{ marked_read: number }>('/notifications/read-all'),
  scan: () => client.post<{ created: number }>('/notifications/scan'),
};
