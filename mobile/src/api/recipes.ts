import client from './client';

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  notes: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  servings: number;
  cuisine: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  created_at: string;
}

export interface IngredientCoverage {
  ingredient_name: string;
  is_matched: boolean;
  pantry_item_name?: string;
  days_until_expiry?: number;
}

export interface RecipeMatch {
  recipe: Recipe;
  coverage: IngredientCoverage[];
  missing_count: number;
  match_percentage: number;
  expiry_boost: number;
  score: number;
}

export const recipesApi = {
  matchStrict: () => client.get<RecipeMatch[]>('/recipes/match/strict'),
  matchNear: (max_missing = 2) =>
    client.get<RecipeMatch[]>(`/recipes/match/near?max_missing=${max_missing}`),
  matchScraps: () => client.get<RecipeMatch[]>('/recipes/match/scraps'),
  matchExpiryRescue: () => client.get<RecipeMatch[]>('/recipes/match/expiry-rescue'),
  get: (id: string) => client.get<Recipe>(`/recipes/${id}`),
  create: (data: any) => client.post<Recipe>('/recipes', data),
};
