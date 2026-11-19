import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { assertUnchanged } from "./_src.mjs";

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
test("currentYear הוא פרמטר, והמיון לפי השם המלא", () => {
  const more = [
    { id: 4, firstName: "דנה", lastName: "לוי", email: "d1@x.com", passwordHash: "h4", birthYear: 2001, isDeleted: false },
    { id: 5, firstName: "דנה", lastName: "אבן", email: "d2@x.com", passwordHash: "h5", birthYear: 1990, isDeleted: false },
  ];
  assert.deepEqual(toPublicUsers(more, 2030), [
    { id: 5, fullName: "דנה אבן", email: "d2@x.com", age: 40 },
    { id: 4, fullName: "דנה לוי", email: "d1@x.com", age: 29 },
  ]);
});
test("המערך והאובייקטים שהתקבלו לא משתנים", () => { assertUnchanged(toPublicUsers, [users, 2026], "המשתמשים שהעברת ל־toPublicUsers"); });
test("אין passwordHash בשום אובייקט", () => { for (const u of toPublicUsers(users, 2026)) assert.equal("passwordHash" in u, false); });
