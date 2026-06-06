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

export const assistantApi = {
  leftoverChef: (body: LeftoverChefRequest = {}) =>
    client.post<LeftoverChefResponse>('/assistant/leftover-chef', {
      max_recipes: 3,
      prioritise_expiring: true,
      ...body,
    }),
};
