import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { confirmationEmail } = await load(import.meta.url, "P26-E95.ts");

test("הדוגמה מהשיעור", () => {
  const e = confirmationEmail({ id: 1, user: { name: "דנה", email: "dana@example.com" }, items: [{ name: "פילטרים לבנים V60", quantity: 2, priceCents: 2990 }], totalCents: 5980 });
  assert.deepEqual(e, { to: "dana@example.com", subject: "אישור הזמנה #1", body: "שלום דנה,\n\nפילטרים לבנים V60 × 2 — ₪59.80\n\nסה״כ: ₪59.80" });
});
test("כמה פריטים, אגורות, וסה״כ מההזמנה", () => {
  const e = confirmationEmail({
    id: 42,
    user: { name: "יוסי", email: "yossi@example.com" },
    items: [
      { name: "אתיופיה", quantity: 3, priceCents: 4590 },
      { name: "מסנן", quantity: 1, priceCents: 5 },
      { name: "ספל", quantity: 10, priceCents: 1999 },
    ],
    totalCents: 33760,
  });
  assert.equal(e.subject, "אישור הזמנה #42");
  assert.equal(e.body, "שלום יוסי,\n\nאתיופיה × 3 — ₪137.70\nמסנן × 1 — ₪0.05\nספל × 10 — ₪199.90\n\nסה״כ: ₪337.60");
});
