import { Colors } from '../theme';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Decimal fields arrive from the API as strings; coerce defensively.
export const formatCurrency = (amount: number | string): string => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
};

export const toNumber = (value: number | string | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const formatExpiryLabel = (days: number | undefined | null, isExpired: boolean): string => {
  if (isExpired) return 'Expired';
  if (days === undefined || days === null) return 'No expiry';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return 'Expired';
  return `${days}d left`;
};

export const getExpiryColor = (days: number | undefined | null, isExpired: boolean): string => {
  if (isExpired || (days !== undefined && days !== null && days <= 0)) return Colors.danger;
  if (days === undefined || days === null) return Colors.textMuted;
  if (days <= 2) return Colors.danger;
  if (days <= 5) return Colors.warning;
  if (days <= 10) return Colors.gold;
  return Colors.success;
};

export const getMonthName = (month: number): string => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1] ?? '';
};
