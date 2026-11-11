// P15-E32: ברכה לפי שפה
import express from "express";

export function createApp() {
  const app = express();
  app.get("/greet/:name", (req, res) => {
    const lang = req.query.lang ?? "he";
    if (lang === "he") {
      res.json({ greeting: `שלום ${req.params.name}` });
      return;
    }
    if (lang === "en") {
      res.json({ greeting: `Hello ${req.params.name}` });
      return;
    }
    res.status(400).json({ error: "שפה לא נתמכת" });
  });
  return app;
}

const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  for (const path of ["/greet/דנה", "/greet/Dana?lang=en", "/greet/x?lang=fr", "/greet/x?lang=en&lang=he"]) {
    const res = await fetch(base + encodeURI(path));
    console.log(res.status, await res.text());
  }
  server.close();
});
