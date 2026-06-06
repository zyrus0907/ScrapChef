import client from './client';

export interface CostSummary {
  month: string; // "YYYY-MM"
  total_saved: number;
  total_wasted: number;
  items_consumed: number;
  items_wasted: number;
  waste_rate: number;
  net_savings: number;
}

export interface MonthlySnapshot {
  month: string; // "YYYY-MM"
  total_saved: number;
  total_wasted: number;
  items_consumed: number;
  items_wasted: number;
  net_savings: number;
}

export const costsApi = {
  summary: (year?: number, month?: number) =>
    client.get<CostSummary>('/costs/summary', { params: { year, month } }),
  history: (months = 6) =>
    client.get<MonthlySnapshot[]>('/costs/history', { params: { months } }),
};
