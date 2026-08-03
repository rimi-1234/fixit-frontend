/** Formats amounts as Bangladeshi Taka (৳ / BDT). */
export function formatCurrency(
  amount: number,
  currency = "BDT",
  locale = "en-BD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
