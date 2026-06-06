import client from './client';

export interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients_used: string[];
  additional_ingredients: string[];
  steps: string[];
  estimated_time_minutes: number;
  uses_expiring_items: boolean;
}

export interface LeftoverChefResponse {
  provider: string; // "claude" | "stub"
  ingredients_considered: number;
  recipes: GeneratedRecipe[];
}

export interface LeftoverChefRequest {
  dietary_preferences?: string[];
  max_recipes?: number;
  prioritise_expiring?: boolean;
  expiring_only?: boolean;
  within_days?: number;
}

export interface ReceiptLine {
  name: string;
  quantity: number | string;
  unit: string;
  price?: number | string | null;
  category?: string | null;
}

export interface ReceiptParseResponse {
  provider: string; // "gemini" | "stub"
  available: boolean;
  store_name?: string | null;
  lines: ReceiptLine[];
}

export interface ParsedIngredient {
  name: string;
  quantity?: number | string | null;
  unit?: string | null;
}

export interface RecipeParseResponse {
  provider: string;
  available: boolean;
  title: string;
  ingredients: ParsedIngredient[];
}

export const assistantApi = {
  leftoverChef: (body: LeftoverChefRequest = {}) =>
    client.post<LeftoverChefResponse>('/assistant/leftover-chef', {
      max_recipes: 3,
      prioritise_expiring: true,
      ...body,
    }),
  parseReceipt: (image_base64: string, mime_type = 'image/jpeg') =>
    client.post<ReceiptParseResponse>('/assistant/receipt', { image_base64, mime_type }),
  parseRecipe: (body: { image_base64?: string; mime_type?: string; text?: string }) =>
    client.post<RecipeParseResponse>('/assistant/recipe', body),
};
