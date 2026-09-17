export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "GBP", label: "British Pound", symbol: "£", locale: "en-GB" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

export function localeForCurrency(code: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.locale ?? "en-US";
}
