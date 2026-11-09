// P28.5-E23: השרת "תקוע" לכולם כשמישהו מתחבר או מייצא — שלוש תקלות
import http from "node:http";
import { pbkdf2Sync } from "node:crypto";
import { gzipSync } from "node:zlib";

const SALT = "coffee-salt";
const EXPORT = Buffer.from(JSON.stringify(Array.from({ length: 200_000 }, (_, i) => ({ id: i, name: `order-${i}`, total: i % 997 }))));

export function createServer(): http.Server {
  return http.createServer(async (req, res) => {
    try {
      if (req.url === "/health") return void res.end("ok");
      if (req.url === "/login") {
        const hash = pbkdf2Sync("secret-password", SALT, 200_000, 32, "sha256");
        return void res.end(hash.toString("hex").slice(0, 8));
      }
      if (req.url === "/export") {
        const body = gzipSync(EXPORT);
        res.setHeader("content-encoding", "gzip");
        return void res.end(body);
      }
      if (req.url === "/slow") {
        const until = Date.now() + 300;
        while (Date.now() < until) {
          // מחכים 300ms
        }
        return void res.end("done");
      }
      res.statusCode = 404;
      res.end();
    } catch {
      res.statusCode = 500;
      res.end();
    }
  });
}
