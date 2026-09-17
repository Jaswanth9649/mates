export { splitEqually } from "./calculate-equal";
export { splitByPercentage } from "./calculate-percentage";
export { exactSplitSumsToTotal } from "./calculate-exact";

export function dollarsToCents(input: string): number {
  const n = Number.parseFloat(input);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
