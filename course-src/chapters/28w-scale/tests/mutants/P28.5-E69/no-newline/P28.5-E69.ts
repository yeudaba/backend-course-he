// P28.5-E69: GET /export.ndjson בזרם
import express from "express";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export function exportApp(rows: () => AsyncIterable<object>) {
  const app = express();
  app.get("/export.ndjson", async (req, res) => {
    res.status(200).type("application/x-ndjson");
    const toLine = new Transform({
      writableObjectMode: true,
      transform(row: object, _encoding, done) {
        done(null, JSON.stringify(row));
      },
    });
    try {
      await pipeline(Readable.from(rows()), toLine, res);
    } catch {
      // הלקוח התנתק, או שגיאה במקור — pipeline כבר סגר את שני הצדדים
      res.destroy();
    }
  });
  return app;
}
