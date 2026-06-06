import client from './client';

export interface CostSummary {
  total_purchased: number;
  total_consumed_value: number;
  total_wasted_value: number;
  savings_rate: number;
  waste_rate: number;
  items_consumed: number;
  items_wasted: number;
}

export interface MonthlySnapshot {
  year: number;
  month: number;
  total_purchased: number;
  consumed_value: number;
  wasted_value: number;
  savings_rate: number;
}

export const costsApi = {
  summary: (year?: number, month?: number) =>
    client.get<CostSummary>('/costs/summary', { params: { year, month } }),
  history: (months = 6) =>
    client.get<MonthlySnapshot[]>('/costs/history', { params: { months } }),
};
