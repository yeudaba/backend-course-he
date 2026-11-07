// P15-E06
import express from "express";

export function createApp() {
  const app = express();

  app.get("/hello", (req, res) => {
    const name = typeof req.query.name === "string" && req.query.name !== "" ? req.query.name : "אורח";
    res.json({ message: `שלום ${name}` });
  });

  app.get("/add/:a/:b", (req, res) => {
    const a = Number(req.params.a);
    const b = Number(req.params.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      res.status(400).json({ error: "a ו־b חייבים להיות מספרים" });
      return;
    }
    res.json({ sum: a + b });
  });

  return app;
}
