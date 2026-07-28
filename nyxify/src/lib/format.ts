export function formatPriceRange(minCents: number, maxCents: number | null | undefined) {
  const min = `$${(minCents / 100).toFixed(2)}`;
  if (!maxCents || maxCents === minCents) return min;
  const max = `$${(maxCents / 100).toFixed(2)}`;
  return `${min} - ${max}`;
}
