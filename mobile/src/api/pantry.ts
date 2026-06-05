import client from './client';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  status: 'active' | 'consumed' | 'wasted';
  expiry_date?: string;
  opened_date?: string;
  purchase_price?: number;
  purchase_date?: string;
  quantity_purchased?: number;
  days_until_expiry?: number;
  is_expired: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddItemPayload {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  barcode?: string;
  expiry_date?: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
}

export const pantryApi = {
  list: () => client.get<PantryItem[]>('/pantry/items'),
  get: (id: string) => client.get<PantryItem>(`/pantry/items/${id}`),
  add: (data: AddItemPayload) => client.post<PantryItem>('/pantry/items', data),
  update: (id: string, data: Partial<AddItemPayload>) =>
    client.patch<PantryItem>(`/pantry/items/${id}`, data),
  delete: (id: string) => client.delete(`/pantry/items/${id}`),
  expiringSoon: (days = 7) =>
    client.get<PantryItem[]>(`/pantry/items/expiring-soon?days=${days}`),
  consume: (id: string, quantity?: number) =>
    client.post<PantryItem>(`/pantry/items/${id}/consume`, quantity ? { quantity } : {}),
  waste: (id: string, quantity?: number) =>
    client.post<PantryItem>(`/pantry/items/${id}/waste`, quantity ? { quantity } : {}),
};
