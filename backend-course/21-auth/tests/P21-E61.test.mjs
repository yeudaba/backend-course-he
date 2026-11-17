import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E61.ts", ["hashToken", "newRefreshToken"]);
const sha = (s) => createHash("sha256").update(s).digest("hex");

test("hashToken", async () => {
  const { hashToken } = await get();
  assert.equal(hashToken("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  for (const s of ["", "x", "eyJhbGciOi", "שלום"]) assert.equal(hashToken(s), sha(s));
});
test("newRefreshToken", async () => {
  const { newRefreshToken } = await get();
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const { token, hash } = newRefreshToken();
    assert.match(token, /^[A-Za-z0-9_-]{43}$/, "43 תווים של base64url (32 בתים)");
    assert.equal(hash, sha(token), "hash הוא SHA-256 hex של הטוקן");
    seen.add(token);
  }
  assert.equal(seen.size, 200, "אקראי: אין שני טוקנים זהים");
  const bytes = Buffer.from(newRefreshToken().token, "base64url");
  assert.equal(bytes.length, 32);
});
