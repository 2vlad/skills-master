/**
 * Format date to YYYYMMDD_HHMM format
 */
export function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * Format number as currency
 */
export function formatCurrency(
  value: number | null,
  currency: 'USD' | 'RUB' | 'EUR'
): string {
  if (value === null) return '—';
  
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(value);
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
