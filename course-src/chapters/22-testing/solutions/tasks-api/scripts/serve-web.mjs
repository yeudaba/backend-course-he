// שרת קבצים סטטי קטן לדפי הדגמה (יחידה 15.5).
//   node serve-web.mjs [תיקייה]   ← http://localhost:5500   (פורט אחר: WEB_PORT=5501)
// בלי תיקייה — מגיש את ../web (כשהקובץ נמצא ב־scripts/ של פרויקט).
// בכוונה על פורט אחר מה־API — כך הדף וה־API הם "origins" שונים, כמו באתר אמיתי.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "web"));
const port = Number(process.env.WEB_PORT ?? 5500);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.join(root, urlPath === "/" ? "index.html" : urlPath);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end("Forbidden"); // ../ מחוץ לתיקייה — פרק 13
      return;
    }
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { "Content-Type": `${types[path.extname(file)] ?? "application/octet-stream"}; charset=utf-8` });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("לא נמצא");
    }
  })
  .listen(port, () => console.log(`מגיש את ${root} ב־http://localhost:${port}`));
