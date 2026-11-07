import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toPublicUsers } = await load(import.meta.url, "P07-E15.js");

const users = [
  { id: 1, firstName: "נועה", lastName: "כהן", email: "n@x.com", passwordHash: "h1", birthYear: 1995, isDeleted: false },
  { id: 2, firstName: "אבי", lastName: "לוי", email: "a@x.com", passwordHash: "h2", birthYear: 1988, isDeleted: false },
  { id: 3, firstName: "גיל", lastName: "בר", email: "g@x.com", passwordHash: "h3", birthYear: 2000, isDeleted: true },
];
test("פורמט, סינון ומיון", () => assert.deepEqual(toPublicUsers(users, 2026), [
  { id: 2, fullName: "אבי לוי", email: "a@x.com", age: 38 },
  { id: 1, fullName: "נועה כהן", email: "n@x.com", age: 31 },
]));
test("אין passwordHash בשום אובייקט", () => { for (const u of toPublicUsers(users, 2026)) assert.equal("passwordHash" in u, false); });
