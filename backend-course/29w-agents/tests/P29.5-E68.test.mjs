import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { signApproval, verifyApproval } = await load(import.meta.url, "P29.5-E68.ts");
const claims = { runId: "run-42", toolUseId: "toolu_1", userId: 7, exp: 2_000 };
const expect = { runId: "run-42", toolUseId: "toolu_1", userId: 7, now: 1_000 };

test("פורמט: payload.sig ב־base64url", () => {
  const tok = signApproval("s3cret", claims);
  const [p, s] = tok.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(p, "base64url").toString()), claims);
  assert.equal(s, createHmac("sha256", "s3cret").update(p).digest("base64url"));
});
test("verify: תקין, ולא תקין בכל דרך", () => {
  const tok = signApproval("s3cret", claims);
  assert.equal(verifyApproval("s3cret", tok, expect), true);
  assert.equal(verifyApproval("other", tok, expect), false, "סוד אחר");
  assert.equal(verifyApproval("s3cret", tok, { ...expect, runId: "run-43" }), false);
  assert.equal(verifyApproval("s3cret", tok, { ...expect, toolUseId: "toolu_2" }), false);
  assert.equal(verifyApproval("s3cret", tok, { ...expect, userId: 8 }), false);
  assert.equal(verifyApproval("s3cret", tok, { ...expect, now: 2_000 }), false, "פג תוקף (now == exp)");
  const [p, s] = tok.split(".");
  const forged = Buffer.from(JSON.stringify({ ...claims, userId: 8 })).toString("base64url");
  assert.equal(verifyApproval("s3cret", `${forged}.${s}`, { ...expect, userId: 8 }), false, "payload ששונה");
  for (const bad of ["", "abc", `${p}.`, `${p}.${s}.x`, `${p}.${s.slice(0, -2)}`, `!!!.${s}`, "a.b"]) assert.equal(verifyApproval("s3cret", bad, expect), false, bad.slice(0, 20));
  const notJson = Buffer.from("not json").toString("base64url");
  const sig = createHmac("sha256", "s3cret").update(notJson).digest("base64url");
  assert.equal(verifyApproval("s3cret", `${notJson}.${sig}`, expect), false, "חתימה נכונה על payload שבור");
});
