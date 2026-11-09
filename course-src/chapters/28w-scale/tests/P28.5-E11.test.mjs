import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { load } from "../../tools/load.mjs";

const { dailyRevenue } = await load(import.meta.url, "P28.5-E11.ts");

test("סכום לכל יום — בשעון ישראל", async () => {
  const lines = [
    { createdAt: "2026-10-30T22:30:00Z", quantity: 2, priceCents: 1000 }, // 00:30 ב־31.10 בישראל (שעון חורף, UTC+2)
    { createdAt: "2026-10-30T21:59:00Z", quantity: 1, priceCents: 500 }, // 23:59 ב־30.10
    { createdAt: "2026-10-01T21:30:00Z", quantity: 1, priceCents: 900 }, // 00:30 ב־2.10 (עוד שעון קיץ, UTC+3)
    { createdAt: "2026-10-31T10:00:00Z", quantity: 1, priceCents: 700, status: "cancelled" },
  ].map((o) => JSON.stringify(o)).join("\n");
  assert.deepEqual(await dailyRevenue(Readable.from([lines])), {
    "2026-10-02": { orders: 1, revenueCents: 900 },
    "2026-10-30": { orders: 1, revenueCents: 500 },
    "2026-10-31": { orders: 1, revenueCents: 2000 },
  });
});
test("300,000 שורות שמגיעות בחתיכות", async () => {
  let n = 0;
  const gen = Readable.from((function* () {
    for (let i = 0; i < 3000; i++) {
      let chunk = "";
      for (let j = 0; j < 100; j++) {
        n++;
        chunk += JSON.stringify({ createdAt: new Date(Date.UTC(2026, 9, 1 + (n % 10), 9)).toISOString(), quantity: 1, priceCents: 100 }) + "\n";
      }
      yield chunk.slice(0, 50); // חותכים כל chunk באמצע שורה
      yield chunk.slice(50);
    }
  })());
  const r = await dailyRevenue(gen);
  assert.equal(Object.values(r).reduce((s, d) => s + d.orders, 0), 300000);
  assert.equal(r["2026-10-05"].revenueCents, 3000000);
});
