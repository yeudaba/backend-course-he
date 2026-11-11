// P15-E33: PUT שיוצר או מחליף
import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  const settings = new Map<string, unknown>();

  app.get("/settings", (req, res) => {
    res.json(Object.fromEntries(settings));
  });

  app.get("/settings/:key", (req, res) => {
    const { key } = req.params;
    if (!settings.has(key)) {
      res.status(404).json({ error: "אין הגדרה כזו" });
      return;
    }
    res.json({ key, value: settings.get(key) });
  });

  app.put("/settings/:key", (req, res) => {
    const { key } = req.params;
    const value = req.body?.value;
    if (value === undefined) {
      res.status(400).json({ error: "חסר value" });
      return;
    }
    const isNew = !settings.has(key);
    settings.set(key, value);
    if (isNew) res.status(201).location(`/settings/${key}`);
    res.json({ key, value });
  });

  return app;
}

const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const put = (key: string, body: unknown) =>
    fetch(`${base}/settings/${key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  for (const res of [await put("theme", { value: "dark" }), await put("theme", { value: "light" }), await put("x", {})]) {
    console.log(res.status, res.headers.get("location"), await res.text());
  }
  console.log(await (await fetch(`${base}/settings`)).text());
  server.close();
});
