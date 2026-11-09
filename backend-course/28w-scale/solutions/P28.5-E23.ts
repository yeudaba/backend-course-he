// P28.5-E23: שרת שה־event loop שלו פנוי — אחרי התיקון
import http from "node:http";
import { pbkdf2 } from "node:crypto";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { setTimeout as sleep } from "node:timers/promises";

const pbkdf2Async = promisify(pbkdf2);
const gzipAsync = promisify(gzip);
const SALT = "coffee-salt";
const EXPORT = Buffer.from(JSON.stringify(Array.from({ length: 200_000 }, (_, i) => ({ id: i, name: `order-${i}`, total: i % 997 }))));

export function createServer(): http.Server {
  return http.createServer(async (req, res) => {
    try {
      if (req.url === "/health") return void res.end("ok");
      if (req.url === "/login") {
        // תיקון 1: pbkdf2 האסינכרוני רץ ב־thread pool של libuv, לא על ה־event loop
        const hash = await pbkdf2Async("secret-password", SALT, 200_000, 32, "sha256");
        return void res.end(hash.toString("hex").slice(0, 8));
      }
      if (req.url === "/export") {
        const body = await gzipAsync(EXPORT); // תיקון 2: גם gzip — ב־thread pool
        res.setHeader("content-encoding", "gzip");
        return void res.end(body);
      }
      if (req.url === "/slow") {
        await sleep(300); // תיקון 3: המתנה שלא חוסמת (במקום while על Date.now)
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
