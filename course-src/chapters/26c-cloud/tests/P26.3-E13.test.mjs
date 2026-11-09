import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { evaluate, wildcardMatch } = await load(import.meta.url, "P26.3-E13.ts");
const pol = (...Statement) => ({ Version: "2012-10-17", Statement });

test("wildcardMatch: * ו־?", () => {
  assert.equal(wildcardMatch("arn:aws:s3:::b/uploads/*", "arn:aws:s3:::b/uploads/1/a.png"), true);
  assert.equal(wildcardMatch("arn:aws:s3:::b/uploads/*", "arn:aws:s3:::b/up"), false);
  assert.equal(wildcardMatch("s3:Get*", "s3:GetObject"), true);
  assert.equal(wildcardMatch("file-?.txt", "file-1.txt"), true);
  assert.equal(wildcardMatch("file-?.txt", "file-12.txt"), false);
  assert.equal(wildcardMatch("a.b", "axb"), false, "נקודה היא נקודה, לא 'כל תו'");
});
test("ברירת המחדל: אין Allow ← implicit-deny", () => {
  assert.equal(evaluate([], "s3:GetObject", "arn:aws:s3:::b/a"), "implicit-deny");
  assert.equal(evaluate([pol({ Effect: "Allow", Action: "s3:PutObject", Resource: "*" })], "s3:GetObject", "arn:aws:s3:::b/a"), "implicit-deny");
});
test("Allow — Action כמחרוזת או מערך, לא רגיש לרישיות", () => {
  const p = pol({ Effect: "Allow", Action: ["s3:GetObject", "s3:PutObject"], Resource: "arn:aws:s3:::b/*" });
  assert.equal(evaluate([p], "s3:PutObject", "arn:aws:s3:::b/x"), "allow");
  assert.equal(evaluate([p], "S3:getobject", "arn:aws:s3:::b/x"), "allow");
  assert.equal(evaluate([p], "s3:GetObject", "arn:aws:s3:::B/x"), "implicit-deny", "ARN — רגיש לרישיות");
});
test("Deny מפורש מנצח Allow — בכל סדר, ובין policies", () => {
  const allowAll = pol({ Effect: "Allow", Action: "s3:*", Resource: "*" });
  const denyBackups = pol({ Effect: "Deny", Action: "s3:*", Resource: "arn:aws:s3:::b/backups/*" });
  assert.equal(evaluate([allowAll, denyBackups], "s3:GetObject", "arn:aws:s3:::b/backups/db.sql"), "explicit-deny");
  assert.equal(evaluate([denyBackups, allowAll], "s3:GetObject", "arn:aws:s3:::b/backups/db.sql"), "explicit-deny");
  assert.equal(evaluate([allowAll, denyBackups], "s3:GetObject", "arn:aws:s3:::b/uploads/a"), "allow");
  const both = pol({ Effect: "Allow", Action: "*", Resource: "*" }, { Effect: "Deny", Action: "iam:*", Resource: "*" });
  assert.equal(evaluate([both], "iam:CreateUser", "arn:aws:iam::1:user/x"), "explicit-deny");
});
