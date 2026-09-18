import { test } from "node:test";
import assert from "node:assert/strict";

import { nextRunDate, isDueByUTC } from "./next-run.ts";

test("weekly advances by exactly 7 days", () => {
  assert.equal(nextRunDate("2026-09-18", "weekly"), "2026-09-25");
});

test("weekly rolls over a month boundary", () => {
  assert.equal(nextRunDate("2026-09-28", "weekly"), "2026-10-05");
});

test("monthly advances to the same day next month", () => {
  assert.equal(nextRunDate("2026-01-15", "monthly"), "2026-02-15");
});

test("monthly clamps Jan 31 to Feb 28 in a non-leap year", () => {
  assert.equal(nextRunDate("2026-01-31", "monthly"), "2026-02-28");
});

test("monthly clamps Jan 31 to Feb 29 in a leap year", () => {
  assert.equal(nextRunDate("2028-01-31", "monthly"), "2028-02-29");
});

test("monthly rolls over a year boundary", () => {
  assert.equal(nextRunDate("2026-12-15", "monthly"), "2027-01-15");
});

test("isDueByUTC is true for today and past dates", () => {
  const now = new Date("2026-09-18T23:00:00Z");
  assert.equal(isDueByUTC("2026-09-18", now), true);
  assert.equal(isDueByUTC("2026-09-01", now), true);
});

test("isDueByUTC is false for a future date", () => {
  const now = new Date("2026-09-18T23:00:00Z");
  assert.equal(isDueByUTC("2026-09-19", now), false);
});
