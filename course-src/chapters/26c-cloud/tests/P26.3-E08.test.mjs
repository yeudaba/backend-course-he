import { test } from "node:test";
import assert from "node:assert/strict";
import { readPolicy, decide, allows } from "./_iam.mjs";

const p = readPolicy(import.meta.url, "P26.3-E08.json");
const OBJ = "arn:aws:s3:::coffee-uploads/";
const BUCKET = "arn:aws:s3:::coffee-uploads";
const QUEUE = "arn:aws:sqs:eu-central-1:123456789012:order-events";

test("מה שהשירות צריך — מותר", () => {
  assert.ok(allows(p, "s3:GetObject", OBJ + "uploads/42/a.pdf"), "קריאה מ־uploads/");
  assert.ok(allows(p, "s3:PutObject", OBJ + "uploads/42/a.pdf"), "כתיבה ל־uploads/");
  assert.ok(allows(p, "s3:ListBucket", BUCKET, { "s3:prefix": "uploads/42/" }), "רשימה תחת uploads/");
  assert.ok(allows(p, "sqs:SendMessage", QUEUE), "שליחה לתור order-events");
});
test("כל השאר — לא", () => {
  assert.equal(decide(p, "s3:DeleteObject", OBJ + "uploads/42/a.pdf"), "implicit-deny", "מחיקה — לא ביקשו");
  assert.equal(decide(p, "s3:GetObject", OBJ + "backups/db.sql"), "implicit-deny", "רק uploads/");
  assert.equal(decide(p, "s3:GetObject", "arn:aws:s3:::other-bucket/uploads/a"), "implicit-deny", "רק ה־bucket הזה");
  assert.equal(decide(p, "s3:ListBucket", BUCKET, { "s3:prefix": "backups/" }), "implicit-deny", "ListBucket מוגבל ב־Condition ל־uploads/");
  assert.equal(decide(p, "sqs:ReceiveMessage", QUEUE), "implicit-deny", "השירות רק שולח");
  assert.equal(decide(p, "sqs:SendMessage", QUEUE.replace("order-events", "payments")), "implicit-deny");
  assert.equal(decide(p, "iam:CreateUser", "*"), "implicit-deny");
});
test("בלי כוכביות רחבות", () => {
  for (const s of p.Statement) {
    for (const a of [s.Action].flat()) assert.ok(!/^\*$|:\*$/.test(a), `Action "${a}" — רחב מדי`);
    for (const r of [s.Resource].flat()) assert.notEqual(r, "*", 'Resource "*" — כל המשאבים בחשבון');
  }
});
