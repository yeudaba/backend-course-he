// P28.5-E69: GET /export.ndjson בזרם
import express from "express";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export function exportApp(rows: () => AsyncIterable<object>) {
  const app = express();
  app.get("/export.ndjson", async (req, res) => {
    res.status(200).type("application/x-ndjson");
    async function* lines() {
      for await (const row of rows()) yield JSON.stringify(row) + "\n";
    }
    try {
      await pipeline(Readable.from(lines()), res);
    } catch {
      // הלקוח התנתק, או שגיאה במקור — pipeline כבר סגר את שני הצדדים
      res.destroy();
    }
  });
  return app;
}
