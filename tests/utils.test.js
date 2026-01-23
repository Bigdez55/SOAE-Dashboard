import assert from "node:assert/strict";
import test from "node:test";

import { formatDate, getStatus } from "../utils.js";

test("getStatus returns complete when completed", () => {
  const status = getStatus({ dueDate: "2030-01-01", completed: true });
  assert.equal(status, "complete");
});

test("getStatus returns overdue for past due date", () => {
  const status = getStatus({ dueDate: "2000-01-01", completed: false });
  assert.equal(status, "overdue");
});

test("getStatus returns open for future due date", () => {
  const nextYear = new Date().getFullYear() + 1;
  const status = getStatus({ dueDate: `${nextYear}-01-01`, completed: false });
  assert.equal(status, "open");
});

test("formatDate returns a readable date", () => {
  const formatted = formatDate("2024-03-15");
  assert.ok(formatted.includes("2024"));
});
