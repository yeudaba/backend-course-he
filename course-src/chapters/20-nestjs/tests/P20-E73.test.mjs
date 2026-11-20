import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("/docs-json", async (t) => {
  const { BooksModule, setupDocs } = exportsOf(import.meta.url, "P20-E73.ts", ["BooksModule", "setupDocs", "CreateBookDto", "BooksController"]);
  const { call } = await nestApp(t, BooksModule, { validation: true, setup: (app) => setupDocs(app) });
  const doc = (await call("GET", "/docs-json")).body;
  assert.equal(doc?.info?.title, "Library API");
  assert.equal(doc.info.version, "2.0");
  assert.deepEqual(Object.keys(doc.paths).sort(), ["/books", "/books/{id}"]);
  assert.ok(doc.paths["/books"].post && doc.paths["/books"].get, "POST ו־GET על /books");
  assert.deepEqual(doc.paths["/books/{id}"].get.tags, ["books"], "@ApiTags(\"books\")");
  assert.deepEqual(doc.paths["/books"].post.tags, ["books"]);
  assert.equal(doc.paths["/books/{id}"].get.responses?.["404"]?.description, "הספר לא נמצא");
  const schema = doc.components?.schemas?.CreateBookDto;
  assert.ok(schema, "CreateBookDto בסכמות");
  assert.deepEqual([...(schema.required ?? [])].sort(), ["title", "year"], "isbn לא חובה");
  assert.deepEqual(Object.keys(schema.properties).sort(), ["isbn", "title", "year"]);
  assert.equal(schema.properties.title.example, "Dune");
  assert.equal((await call("GET", "/docs")).status, 200, "דף התיעוד");
  assert.equal((await call("POST", "/books", { title: "Dune", year: 1965 })).status, 201);
  assert.equal((await call("POST", "/books", { title: "Dune" })).status, 400, "ולידציה של class-validator");
});
test("GET /books/:id — הספר הנכון, ו־404", async (t) => {
  const { BooksModule } = exportsOf(import.meta.url, "P20-E73.ts", ["BooksModule"]);
  const { call } = await nestApp(t, BooksModule, { validation: true });
  await call("POST", "/books", { title: "Dune", year: 1965 });
  await call("POST", "/books", { title: "Emma", year: 1815 });
  assert.equal((await call("GET", "/books/2")).body.title, "Emma");
  assert.equal((await call("GET", "/books/9")).status, 404);
});
