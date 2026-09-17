export function formatCurrency(cents: number, currency = "USD") {
  const value = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
  return cents < 0 ? `-${formatted}` : formatted;
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
