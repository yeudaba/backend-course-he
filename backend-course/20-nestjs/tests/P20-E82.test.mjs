import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { exportsOf } from "./_nest.mjs";

const require = createRequire(import.meta.url);
const get = () => exportsOf(import.meta.url, "P20-E82.ts", ["listEndpoints", "requiredFields"]);

test("על מסמך סינתטי", () => {
  const { listEndpoints, requiredFields } = get();
  const doc = {
    paths: {
      "/z": { delete: {}, get: {} },
      "/a/{id}": { parameters: [], patch: {}, put: {}, get: {}, delete: {} },
      "/a": { post: {}, get: {} },
    },
    components: { schemas: { X: { required: ["b", "a"] }, Y: { properties: {} } } },
  };
  assert.deepEqual(listEndpoints(doc), ["GET /a", "POST /a", "GET /a/{id}", "PUT /a/{id}", "PATCH /a/{id}", "DELETE /a/{id}", "GET /z", "DELETE /z"]);
  assert.deepEqual(requiredFields(doc, "X"), ["a", "b"]);
  assert.deepEqual(doc.components.schemas.X.required, ["b", "a"], "המסמך לא השתנה");
  assert.deepEqual(requiredFields(doc, "Y"), []);
  assert.throws(() => requiredFields(doc, "Nope"), { message: "אין סכמה Nope" });
  assert.deepEqual(listEndpoints({ paths: {} }), []);
});
test("על מסמך אמיתי של Swagger", async () => {
  const { listEndpoints, requiredFields } = get();
  const { loadNest } = await import("../../tools/nest.mjs");
  const { NestFactory } = require("@nestjs/core");
  const { DocumentBuilder, SwaggerModule } = require("@nestjs/swagger");
  const { DemoModule } = loadNest(import.meta.url, "../tests/_P20-E82-demo.ts");
  const app = await NestFactory.create(DemoModule, { logger: false });
  const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle("demo").build());
  await app.close();
  assert.deepEqual(listEndpoints(doc), ["GET /books", "POST /books", "GET /books/{id}", "PATCH /books/{id}", "DELETE /books/{id}"]);
  assert.deepEqual(requiredFields(doc, "CreateBookDto"), ["title", "year"]);
});
