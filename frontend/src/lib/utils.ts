export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export function formatNumber(value: number | string | null | undefined, decimals = 2) {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return '0.00';

  // Always show fixed two decimal places by default (or `decimals` if provided).
  const fixed = Math.round(Number(num) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return fixed.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
