// P23-E65 — בדיקה קטנה (רצה ב־npm test, בשלב ה־build)
import { test } from "node:test";
import assert from "node:assert/strict";

test("1 + 1", () => assert.equal(1 + 1, 2));
