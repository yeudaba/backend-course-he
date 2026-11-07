import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";
import express from "express";
import { z } from "zod";

const { validate } = await load(import.meta.url, "P15-E15.ts");

test("validate", async (t) => {
  const app = express();
  app.use(express.json());
  app.patch(
    "/tasks/:id",
    validate({
      params: z.object({ id: z.coerce.number().int().positive() }),
      query: z.object({ notify: z.enum(["true", "false"]).default("false") }),
      body: z.object({ title: z.string().trim().min(1) }),
    }),
    (req, res) => res.json({ body: req.body, query: res.locals.query, params: res.locals.params })
  );
  app.post("/only-body", validate({ body: z.object({ n: z.number() }) }), (req, res) => res.json({ body: req.body, query: res.locals.query ?? null }));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);

  let res = await call("PATCH", "/tasks/7", { title: "  שלום ", extra: 1 });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { body: { title: "שלום" }, query: { notify: "false" }, params: { id: 7 } });

  res = await call("PATCH", "/tasks/abc?notify=maybe", { title: "" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.equal(res.body.error.message, "קלט לא תקין");
  assert.deepEqual(res.body.error.details.map((d) => d.path).sort(), ["body.title", "params.id", "query.notify"]);

  res = await call("POST", "/only-body?x=1", { n: 5 });
  assert.deepEqual(res.body, { body: { n: 5 }, query: null });
});
