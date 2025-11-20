export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export function formatNumber(value: number | string | null | undefined, decimals = 2) {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return '0.00';
  // Try to respect user settings (if available) for decimals/format
  try {
    const raw = localStorage.getItem('coinlabs_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.decimals === 'number') decimals = parsed.decimals;
        const numFormat: string = parsed.numberFormat;
        if (numFormat === 'abbreviated') {
          // abbreviated form: 50.32K etc.
          const abs = Math.abs(Number(num));
          const sign = Number(num) < 0 ? '-' : '';
          if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(decimals) + 'B';
          if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(decimals) + 'M';
          if (abs >= 1_000) return sign + (abs / 1_000).toFixed(decimals) + 'K';
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // Always show fixed decimal places
  const fixed = Math.round(Number(num) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return fixed.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
