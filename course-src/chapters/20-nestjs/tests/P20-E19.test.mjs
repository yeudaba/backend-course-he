import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { BooksModule, setupDocs } = loadNest(import.meta.url, "P20-E19.ts");

test("/docs-json", async (t) => {
  const { call } = await nestApp(t, BooksModule, { validation: true, setup: (app) => setupDocs(app) });
  const res = await call("GET", "/docs-json");
  assert.equal(res.status, 200, "Swagger ב־/docs");
  const doc = res.body;
  assert.equal(doc.info.title, "Library API");
  assert.equal(doc.info.version, "1.0");
  assert.ok(doc.paths["/books"]?.get && doc.paths["/books"]?.post, "GET ו־POST /books");
  assert.deepEqual(doc.paths["/books"].post.tags, ["books"]);
  const schema = doc.components?.schemas?.CreateBookDto;
  assert.ok(schema, "CreateBookDto בסכמות");
  assert.deepEqual(Object.keys(schema.properties).sort(), ["title", "year"]);
  assert.deepEqual(schema.required, ["title"], "year אופציונלי");
  assert.equal(schema.properties.title.example, "Dune");
  assert.ok(doc.components.schemas.BookDto?.properties?.id, "BookDto (התשובה של POST) עם id");
  assert.equal((await call("GET", "/docs")).status, 200, "ממשק ה־HTML");
});
test("ה־API עצמו", async (t) => {
  const { call } = await nestApp(t, BooksModule, { validation: true });
  assert.deepEqual((await call("POST", "/books", { title: "Dune", year: 1965 })).body, { id: 1, title: "Dune", year: 1965 });
  assert.equal((await call("POST", "/books", { title: "" })).status, 400);
});
