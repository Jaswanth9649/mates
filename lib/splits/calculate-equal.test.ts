import { test } from "node:test";
import assert from "node:assert/strict";

import { splitEqually } from "./calculate-equal.ts";

test("splits evenly when totalCents divides cleanly", () => {
  const result = splitEqually(3000, ["a", "b", "c"]);
  assert.deepEqual(result, { a: 1000, b: 1000, c: 1000 });
});

test("assigns remainder cents to the first members in order", () => {
  // $10.01 among 3 people: 1001 / 3 = 333 remainder 2
  const result = splitEqually(1001, ["a", "b", "c"]);
  assert.deepEqual(result, { a: 334, b: 334, c: 333 });
  assert.equal(Object.values(result).reduce((s, v) => s + v, 0), 1001);
});

test("handles a single participant", () => {
  const result = splitEqually(999, ["a"]);
  assert.deepEqual(result, { a: 999 });
});

test("returns an empty object for zero participants", () => {
  assert.deepEqual(splitEqually(1000, []), {});
});

test("handles zero total", () => {
  const result = splitEqually(0, ["a", "b"]);
  assert.deepEqual(result, { a: 0, b: 0 });
});
