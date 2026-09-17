import { test } from "node:test";
import assert from "node:assert/strict";

import { splitByPercentage } from "./calculate-percentage.ts";

function sum(result: Record<string, number>) {
  return Object.values(result).reduce((s, v) => s + v, 0);
}

test("splits cleanly when percentages divide evenly", () => {
  const result = splitByPercentage(10000, [
    { id: "a", percent: 50 },
    { id: "b", percent: 50 },
  ]);
  assert.deepEqual(result, { a: 5000, b: 5000 });
});

test("always sums exactly to totalCents despite rounding", () => {
  // 33.33/33.33/33.34 of $100.00 — floors would otherwise lose a cent
  const result = splitByPercentage(10000, [
    { id: "a", percent: 33.33 },
    { id: "b", percent: 33.33 },
    { id: "c", percent: 33.34 },
  ]);
  assert.equal(sum(result), 10000);
});

test("gives the remainder cent to the largest fractional remainder", () => {
  // 1/3 each of $10.00 (1000 cents): exact = 333.33 each, floor = 333 each,
  // remainder = 1 cent, all fracs tied at .33 -> goes to the first share.
  const result = splitByPercentage(1000, [
    { id: "a", percent: 100 / 3 },
    { id: "b", percent: 100 / 3 },
    { id: "c", percent: 100 / 3 },
  ]);
  assert.equal(sum(result), 1000);
  assert.equal(result.a, 334);
});

test("handles a 100% single share", () => {
  const result = splitByPercentage(4999, [{ id: "a", percent: 100 }]);
  assert.deepEqual(result, { a: 4999 });
});
