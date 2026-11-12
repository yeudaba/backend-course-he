import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_nest.mjs";

test("routesOf", () => {
  const { Prefix, Route, routesOf } = exportsOf(import.meta.url, "P20-E43.ts", ["Prefix", "Route", "routesOf"]);
  const apply = (cls, prefix, methods) => {
    for (const [name, method, path] of methods) {
      cls.prototype[name] = function () {};
      const d = Object.getOwnPropertyDescriptor(cls.prototype, name);
      Route(method, path)(cls.prototype, name, d);
    }
    if (prefix !== undefined) Prefix(prefix)(cls);
    return cls;
  };
  const Products = apply(class Products {}, "products", [["list", "GET"], ["findOne", "GET", ":id"], ["create", "POST"], ["remove", "DELETE", ":id"]]);
  assert.deepEqual(routesOf(Products), ["GET /products -> list", "GET /products/:id -> findOne", "POST /products -> create", "DELETE /products/:id -> remove"]);
  const Root = apply(class Root {}, undefined, [["health", "GET", "health"], ["byId", "GET", ":id"]]);
  assert.deepEqual(routesOf(Root), ["GET /health -> health", "GET /:id -> byId"]);
  const Other = apply(class Products {}, "other", [["x", "GET"]]);
  assert.deepEqual(routesOf(Other), ["GET /other -> x"], "מחלקה אחרת עם אותו שם — מידע נפרד");
  assert.deepEqual(routesOf(Products).length, 4);
  assert.deepEqual(routesOf(class Empty {}), []);
});
