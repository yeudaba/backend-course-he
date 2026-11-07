// P14-E17
import { Readable } from "node:stream";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function readJsonBody(req, { limit = 1_000_000 } = {}) {
  if (!req.headers["content-type"]?.includes("application/json")) {
    throw new HttpError(415, "Content-Type חייב להיות application/json");
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.from(chunk);
    size += buf.length;
    if (size > limit) throw new HttpError(413, "הגוף גדול מדי");
    chunks.push(buf);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.trim() === "") throw new HttpError(400, "גוף ריק");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "JSON לא תקין");
  }
}

// אות עברית (2 בתים) שנחתכת בין שתי חתיכות:
const bytes = Buffer.from('{"name":"שלום"}');
const req = Readable.from([bytes.subarray(0, 10), bytes.subarray(10)]);
req.headers = { "content-type": "application/json" };
console.log(await readJsonBody(req));
