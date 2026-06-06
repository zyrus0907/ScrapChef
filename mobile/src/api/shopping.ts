import client from './client';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  category: string;
  is_purchased: boolean;
  source: 'manual' | 'suggested' | string;
  notes: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  is_archived: boolean;
  total_items: number;
  is_complete: boolean;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface RestockSuggestion {
  name: string;
  category: string;
  unit: string;
  suggested_quantity: number | string;
  reason: string;
}

export interface AddListItemPayload {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  notes?: string;
}

export const shoppingApi = {
  lists: (includeArchived = false) =>
    client.get<ShoppingList[]>('/shopping/lists', {
      params: { include_archived: includeArchived },
    }),
  getList: (id: string) => client.get<ShoppingList>(`/shopping/lists/${id}`),
  createList: (name: string) => client.post<ShoppingList>('/shopping/lists', { name }),
  archiveList: (id: string) => client.post<ShoppingList>(`/shopping/lists/${id}/archive`),
  deleteList: (id: string) => client.delete(`/shopping/lists/${id}`),
  addItem: (listId: string, data: AddListItemPayload) =>
    client.post<ShoppingList>(`/shopping/lists/${listId}/items`, data),
  updateItem: (listId: string, itemId: string, data: Partial<AddListItemPayload>) =>
    client.patch<ShoppingList>(`/shopping/lists/${listId}/items/${itemId}`, data),
  toggleItem: (listId: string, itemId: string) =>
    client.post<ShoppingList>(`/shopping/lists/${listId}/items/${itemId}/toggle`),
  removeItem: (listId: string, itemId: string) =>
    client.delete<ShoppingList>(`/shopping/lists/${listId}/items/${itemId}`),
  suggestions: (withinDays = 30) =>
    client.get<RestockSuggestion[]>('/shopping/suggestions', {
      params: { within_days: withinDays },
    }),
};
