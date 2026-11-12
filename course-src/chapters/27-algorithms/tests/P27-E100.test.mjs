import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { indexUsage } = await load(import.meta.url, "P27-E100.ts");
const idx = ["ownerId", "status", "createdAt"];

test("קידומת שמאלית", () => {
  assert.deepEqual(indexUsage(idx, { equals: ["ownerId", "status"], orderBy: "createdAt" }), { usable: true, columns: 2, sortFromIndex: true });
  assert.deepEqual(indexUsage(idx, { equals: ["ownerId"], orderBy: "createdAt" }), { usable: true, columns: 1, sortFromIndex: false }, "status באמצע חסר");
  assert.deepEqual(indexUsage(idx, { equals: ["status"] }), { usable: false, columns: 0, sortFromIndex: false }, "בלי ownerId — אין קידומת");
  assert.deepEqual(indexUsage(idx, { equals: ["status", "ownerId"], range: "createdAt" }), { usable: true, columns: 3, sortFromIndex: false }, "סדר ה־equals בשאילתה לא משנה");
  assert.deepEqual(indexUsage(idx, { equals: ["ownerId"], range: "status", orderBy: "status" }), { usable: true, columns: 2, sortFromIndex: true });
  assert.deepEqual(indexUsage(["createdAt", "ownerId"], { equals: ["ownerId"], orderBy: "createdAt" }), { usable: false, columns: 0, sortFromIndex: true }, "אפשר לקרוא לפי הסדר — אבל לא לסנן");
  assert.deepEqual(indexUsage(idx, { equals: ["ownerId", "status", "createdAt"] }), { usable: true, columns: 3, sortFromIndex: false });
  assert.deepEqual(indexUsage(idx, { equals: [], range: "ownerId" }), { usable: true, columns: 1, sortFromIndex: false });
});
