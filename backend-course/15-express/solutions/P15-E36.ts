// P15-E36: קישורים מקוצרים
import express from "express";

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !/^https?:\/\//.test(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const codeToUrl = new Map<string, string>();
  const urlToCode = new Map<string, string>();
  let next = 1;

  app.post("/links", (req, res) => {
    const url = req.body?.url;
    if (!isHttpUrl(url)) {
      res.status(400).json({ error: "כתובת לא תקינה" });
      return;
    }
    const existing = urlToCode.get(url);
    if (existing) {
      res.json({ code: existing, url });
      return;
    }
    const code = String(next++);
    codeToUrl.set(code, url);
    urlToCode.set(url, code);
    res.status(201).location(`/links/${code}`).json({ code, url });
  });

  app.get("/links/:code", (req, res) => {
    const url = codeToUrl.get(req.params.code);
    if (!url) {
      res.status(404).json({ error: "קישור לא קיים" });
      return;
    }
    res.status(302).location(url).end();
  });

  return app;
}

const server = createApp().listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  const post = (url: unknown) => fetch(`${base}/links`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
  for (const res of [await post("https://example.com/a?b=1"), await post("https://example.com/a?b=1"), await post("javascript:alert(1)")]) {
    console.log(res.status, await res.text());
  }
  const go = await fetch(`${base}/links/1`, { redirect: "manual" });
  console.log(go.status, go.headers.get("location"));
  server.close();
});
