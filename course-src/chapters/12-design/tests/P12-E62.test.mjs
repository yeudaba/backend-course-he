import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E62.ts";
const get = () => exportsOf(import.meta.url, FILE, ["CouponService", "CouponError"]);

function makeRepo(coupons) {
  const store = new Map(coupons.map((c) => [c.code, { ...c }]));
  const saves = [];
  return {
    saves,
    store,
    repo: {
      async find(code) {
        const c = store.get(code);
        return c ? { ...c } : null;
      },
      async save(c) {
        saves.push({ ...c });
        store.set(c.code, { ...c });
      },
    },
  };
}
const base = { code: "SALE10", percent: 10, expiresAt: 5000, usesLeft: 2, minTotal: 50 };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { CouponService } from "FILE";
import type { CouponRepository, Coupon } from "FILE";
const repo: CouponRepository = { async find(code: string) { return null; }, async save(c: Coupon) {} };
const s = new CouponService(repo, () => 0);
const p: Promise<number> = s.apply("x", 10);
// @ts-expect-error — now היא פונקציה
new CouponService(repo, 0);
export { p };
`);
  assert.ok(r.ok, r.message);
});
test("הנחה, נרמול קוד ושמירה עם usesLeft קטן ב־1", async () => {
  const { CouponService } = await get();
  const { repo, saves, store } = makeRepo([base]);
  const s = new CouponService(repo, () => 1000);
  assert.equal(await s.apply(" sale10 ", 199.9), 179.91);
  assert.equal(saves.length, 1);
  assert.equal(store.get("SALE10").usesLeft, 1);
  assert.equal(await s.apply("SALE10", 50), 45, "בדיוק המינימום — מותר");
  assert.equal(store.get("SALE10").usesLeft, 0);
});
test("שגיאות, בסדר הנכון, ובלי שמירה", async () => {
  const { CouponService, CouponError } = await get();
  const { repo, saves } = makeRepo([base, { ...base, code: "USED", usesLeft: 0 }, { ...base, code: "OLD", expiresAt: 900, usesLeft: 0 }]);
  let t = 1000;
  const s = new CouponService(repo, () => t);
  const fails = async (code, total, message) => {
    await assert.rejects(s.apply(code, total), (e) => e instanceof CouponError && e.name === "CouponError" && e.message === message, `${code}/${total} ← ${message}`);
  };
  await fails("NOPE", 100, "קופון לא קיים");
  await fails("OLD", 100, "הקופון פג תוקף");
  await fails("USED", 100, "הקופון נוצל");
  await fails("SALE10", 49.99, "מינימום הזמנה: 50");
  t = 5000;
  await fails("SALE10", 100, "הקופון פג תוקף");
  assert.equal(saves.length, 0, "כשנזרקת שגיאה — לא שומרים כלום");
});
test("השעון נקרא בכל apply (לא פעם אחת ב־constructor)", async () => {
  const { CouponService } = await get();
  const { repo } = makeRepo([base]);
  let t = 0;
  const s = new CouponService(repo, () => t);
  t = 1000;
  assert.equal(await s.apply("SALE10", 100), 90);
  t = 6000;
  await assert.rejects(s.apply("SALE10", 100), { message: "הקופון פג תוקף" });
});
