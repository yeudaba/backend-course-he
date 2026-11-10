import { test } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { exportsOf, typecheck } from "./_ts.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const FILE = "P25.7-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["objectIdDate", "objectIdFromDate", "idRangeForDay"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("objectIdDate — ארבעת הבתים הראשונים הם שניות", async () => {
  const { objectIdDate } = await get();
  assert.equal(objectIdDate("6af2d6084b1c2d3e4f5a6b7c").toISOString(), "2026-11-10T08:30:00.000Z");
  assert.equal(objectIdDate("6AF2D6084B1C2D3E4F5A6B7C").toISOString(), "2026-11-10T08:30:00.000Z", "גם אותיות גדולות");
  for (let i = 0; i < 20; i++) {
    const id = new ObjectId();
    assert.equal(objectIdDate(id.toHexString()).getTime(), id.getTimestamp().getTime());
  }
  for (const bad of ["6af2d608", "6af2d6084b1c2d3e4f5a6b7cz", "zzf2d6084b1c2d3e4f5a6b7c", ""]) assert.throws(() => objectIdDate(bad), TypeError, bad);
});
test("objectIdFromDate — 8 תווים של זמן ו־16 אפסים", async () => {
  const { objectIdFromDate } = await get();
  assert.equal(objectIdFromDate(new Date("2026-11-10T08:30:00Z")), "6af2d6080000000000000000");
  assert.equal(objectIdFromDate(new Date("2026-11-10T08:30:00.999Z")), "6af2d6080000000000000000", "מעגלים את המילישניות למטה");
  assert.equal(objectIdFromDate(new Date("1970-01-01T00:01:00Z")), "0000003c0000000000000000", "padStart — תמיד 8 תווים");
  const at = new Date("2027-03-01T12:00:00Z");
  assert.equal(objectIdFromDate(at), ObjectId.createFromTime(at.getTime() / 1000).toHexString());
});
test("idRangeForDay — היום לפי UTC, מחצות עד חצות", async () => {
  const { idRangeForDay } = await get();
  assert.deepEqual(idRangeForDay("2026-11-10"), { $gte: "6af25e800000000000000000", $lt: "6af3b0000000000000000000" });
  assert.deepEqual(idRangeForDay("2026-12-31").$lt, "6b36ec800000000000000000", "המעבר לשנה הבאה");
  for (const bad of ["10/11/2026", "2026-1-5", "today"]) assert.throws(() => idRangeForDay(bad), TypeError, bad);
});
test("מול MongoDB: אילו מסמכים נוצרו ביום מסוים — בלי שדה createdAt", async (t) => {
  const { idRangeForDay } = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  const at = (iso) => ObjectId.createFromTime(Date.parse(iso) / 1000);
  await db.collection("events").insertMany([
    { _id: at("2026-11-09T23:59:59Z"), n: 1 },
    { _id: at("2026-11-10T00:00:00Z"), n: 2 },
    { _id: at("2026-11-10T13:45:00Z"), n: 3 },
    { _id: at("2026-11-10T23:59:59Z"), n: 4 },
    { _id: at("2026-11-11T00:00:00Z"), n: 5 },
  ]);
  const r = idRangeForDay("2026-11-10");
  const docs = await db.collection("events").find({ _id: { $gte: new ObjectId(r.$gte), $lt: new ObjectId(r.$lt) } }).sort({ _id: 1 }).toArray();
  assert.deepEqual(docs.map((d) => d.n), [2, 3, 4], "חצות בהתחלה — כן, חצות בסוף — לא");
});
