import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";
import express from "express";

const { HttpError, notFound, errorHandler } = await load(import.meta.url, "P15-E10.ts");

test("שגיאות", async (t) => {
  const app = express();
  app.use(express.json());
  app.get("/missing", () => { throw new HttpError(404, "TASK_NOT_FOUND", "המשימה לא נמצאה"); });
  app.get("/async", async () => { await null; throw new HttpError(409, "CONFLICT", "התנגשות"); });
  app.get("/bug", () => { throw new Error("סוד פנימי"); });
  app.post("/echo", (req, res) => res.json(req.body));
  app.use(notFound);
  app.use(errorHandler);
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);

  let res = await call("GET", "/missing");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "TASK_NOT_FOUND", message: "המשימה לא נמצאה" } });
  res = await call("GET", "/async");
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, "CONFLICT");
  res = await call("POST", "/echo", undefined, { raw: "{oops" });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: { code: "INVALID_JSON", message: "JSON לא תקין" } });
  res = await call("DELETE", "/x/y");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "NOT_FOUND", message: "אין כתובת DELETE /x/y" } });

  const logged = [];
  const orig = console.error;
  console.error = (...a) => logged.push(a);
  try {
    res = await call("GET", "/bug");
  } finally {
    console.error = orig;
  }
  assert.equal(res.status, 500);
  assert.deepEqual(res.body, { error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  assert.equal(logged.length, 1, "צריך console.error לשגיאה הפנימית");
});
