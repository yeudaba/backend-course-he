// P14-E24
import fs from "node:fs";
import http from "node:http";

const segments = (p) => p.split("/").filter(Boolean);

function matchParts(pattern, parts) {
  if (pattern.length !== parts.length) return null;
  const params = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(":")) params[pattern[i].slice(1)] = decodeURIComponent(parts[i]);
    else if (pattern[i] !== parts[i]) return null;
  }
  return params;
}

async function readBody(req) {
  if (!req.headers["content-type"]?.includes("application/json")) return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  if (text === "") return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("JSON לא תקין"), { status: 400 });
  }
}

function enhance(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    if (res.statusCode === 204) return res.end();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
  };
}

export function createApp() {
  const middleware = [];
  const routes = [];

  async function route(req, res) {
    const parts = segments(req.path);
    const allow = [];
    for (const r of routes) {
      const params = matchParts(r.pattern, parts);
      if (!params) continue;
      if (r.method !== req.method) {
        allow.push(r.method);
        continue;
      }
      req.params = params;
      return r.handler(req, res);
    }
    if (allow.length > 0) {
      res.setHeader("Allow", allow.join(", "));
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    res.status(404).json({ error: "לא נמצא" });
  }

  async function handle(req, res) {
    enhance(res);
    try {
      const url = new URL(req.url, "http://localhost");
      req.path = url.pathname;
      req.query = Object.fromEntries(url.searchParams);
      req.params = {};
      req.body = await readBody(req);
      let i = 0;
      const next = async () => {
        const fn = middleware[i++];
        if (fn) await fn(req, res, next);
        else await route(req, res);
      };
      await next();
    } catch (err) {
      if (res.headersSent) return res.end();
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: "שגיאה פנימית" });
    }
  }

  const app = {
    use(fn) {
      middleware.push(fn);
    },
    listen(port, cb) {
      return http.createServer(handle).listen(port, cb);
    },
  };
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    app[method] = (pattern, handler) => routes.push({ method: method.toUpperCase(), pattern: segments(pattern), handler });
  }
  return app;
}

// הדגמה — רק כשמריצים את הקובץ ישירות (node P14-E24.mjs), לא כשהבדיקות טוענות אותו
if (fs.realpathSync(process.argv[1]) === import.meta.filename) {
  const app = createApp();
  app.get("/products/:id", (req, res) => res.json({ id: req.params.id, sort: req.query.sort }));
  const server = app.listen(0, async () => {
    const res = await fetch(`http://localhost:${server.address().port}/products/7?sort=price`);
    console.log(res.status, await res.json());
    server.close();
  });
}
