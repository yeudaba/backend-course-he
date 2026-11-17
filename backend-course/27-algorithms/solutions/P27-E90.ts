// P27-E90: ETag ו־304 ב־Express
import { createHash } from "node:crypto";
import express from "express";

export function catalogApp(getProducts: () => unknown) {
  const app = express();
  app.set("etag", false);
  app.get("/products", (req, res) => {
    const body = JSON.stringify(getProducts());
    const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
    res.set({ ETag: etag, "Cache-Control": "no-cache" });
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.type("json").send(body);
  });
  return app;
}
