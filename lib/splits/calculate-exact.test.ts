import { test } from "node:test";
import assert from "node:assert/strict";

import { exactSplitSumsToTotal } from "./calculate-exact.ts";

test("accepts splits that sum exactly to the total", () => {
  assert.equal(
    exactSplitSumsToTotal(1000, [{ amountCents: 400 }, { amountCents: 600 }]),
    true
  );
});

test("rejects splits that sum to less than the total", () => {
  assert.equal(
    exactSplitSumsToTotal(1000, [{ amountCents: 400 }, { amountCents: 500 }]),
    false
  );
});

test("rejects splits that sum to more than the total", () => {
  assert.equal(
    exactSplitSumsToTotal(1000, [{ amountCents: 400 }, { amountCents: 700 }]),
    false
  );
});

test("treats an empty split list as summing to zero", () => {
  assert.equal(exactSplitSumsToTotal(0, []), true);
  assert.equal(exactSplitSumsToTotal(100, []), false);
});
