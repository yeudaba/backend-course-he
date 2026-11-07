import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { updateEmail } = await load(import.meta.url, "P19-E22.ts");

test("שגיאות מתורגמות נכון", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.equal((await updateEmail(prisma, 4, "avi.p@example.com")).email, "avi.p@example.com");
  await assert.rejects(updateEmail(prisma, 99, "x@example.com"), (e) => e.code === "CUSTOMER_NOT_FOUND");
  await assert.rejects(updateEmail(prisma, 4, "dana@example.com"), (e) => e.code === "EMAIL_TAKEN");
  const broken = { customer: { update: async () => { throw new Error("connection refused"); } } };
  await assert.rejects(updateEmail(broken, 4, "a@b.c"), { message: "connection refused" }, "שגיאה אחרת — כמו שהיא");
});
