import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typeProbe } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E82.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseListQuery"])).parseListQuery;
const SORT = ["createdAt", "price", "name"];
const show = (q) => JSON.stringify(q);
const PAGE = { path: "page", message: "page חייב להיות מספר שלם חיובי" };
const LIMIT = { path: "limit", message: "limit חייב להיות בין 1 ל־100" };
const sortIssue = (allowed) => ({ path: "sort", message: `אפשר למיין לפי: ${allowed.join(", ")}` });
const fail = (details) => ({ ok: false, error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details } });

test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("התוצאה היא union לפי ok", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseListQuery } from "FILE";
const r = parseListQuery({}, ["price"]);
if (r.ok) {
  const n: number = r.value.page + r.value.offset;
  const o: "asc" | "desc" = r.value.order;
} else {
  const p: string = r.error.details[0].path;
}
// @ts-expect-error — בלי לבדוק ok אין value
r.value;
export {};
`);
  assert.ok(r.ok, r.message);
});
test("ברירות מחדל וחישוב offset", async () => {
  const parse = await get();
  assert.deepEqual(parse({}, SORT), { ok: true, value: { page: 1, limit: 20, offset: 0, sort: "createdAt", order: "asc" } }, `parseListQuery({}, ${show(SORT)})`);
  assert.deepEqual(parse({}, ["name"]).value?.sort, "name", 'parseListQuery({}, ["name"]) — ברירת המחדל של sort היא השדה הראשון ברשימה');
  const q = { page: "3", limit: "25" };
  assert.deepEqual(parse(q, SORT), { ok: true, value: { page: 3, limit: 25, offset: 50, sort: "createdAt", order: "asc" } }, `parseListQuery(${show(q)})`);
  for (const [limit, want] of [["1", 1], ["100", 100]]) {
    assert.equal(parse({ limit }, SORT).value?.limit, want, `parseListQuery(${show({ limit })}) — בגבול, תקין`);
  }
});
test("sort ו־order", async () => {
  const parse = await get();
  for (const [sort, want] of [["price", ["price", "asc"]], ["-price", ["price", "desc"]], ["-name", ["name", "desc"]]]) {
    const r = parse({ sort }, SORT);
    assert.deepEqual([r.value?.sort, r.value?.order], want, `parseListQuery(${show({ sort })})`);
  }
  assert.deepEqual(parse({ sort: "password" }, SORT), fail([sortIssue(SORT)]), 'parseListQuery({ sort: "password" }) — שדה שלא ברשימה');
  assert.deepEqual(parse({ sort: "-" }, ["id"]), fail([sortIssue(["id"])]), 'parseListQuery({ sort: "-" }, ["id"]) — אין שם שדה');
});
test("page ו־limit לא תקינים", async () => {
  const parse = await get();
  for (const page of ["0", "-1", "abc", "1.5", "1e2", "", " "]) {
    assert.deepEqual(parse({ page }, SORT), fail([PAGE]), `parseListQuery(${show({ page })}) — רק ספרות, ≥ 1`);
  }
  for (const limit of ["0", "101", "x", "2.5"]) {
    assert.deepEqual(parse({ limit }, SORT), fail([LIMIT]), `parseListQuery(${show({ limit })}) — רק ספרות, 1–100`);
  }
  assert.deepEqual(parse({ page: ["1", "2"] }, SORT), fail([PAGE]), "parseListQuery({ page: [\"1\", \"2\"] }) — מ־?page=1&page=2 מגיע מערך, וזה לא תקין");
});
test("כל הבעיות יחד, בסדר page, limit, sort", async () => {
  const parse = await get();
  const q = { sort: "x", limit: "500", page: "0" };
  assert.deepEqual(parse(q, SORT), fail([PAGE, LIMIT, sortIssue(SORT)]), `parseListQuery(${show(q)})`);
});
