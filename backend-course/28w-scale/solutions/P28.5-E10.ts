// P28.5-E10: Transform שמפרק NDJSON לאובייקטים — גם כש־chunk נחתך באמצע שורה, ובאמצע תו
import { Transform, type TransformCallback } from "node:stream";
import { StringDecoder } from "node:string_decoder";

export function ndjsonParser(): Transform {
  const decoder = new StringDecoder("utf8"); // מחזיק בתים של תו שנחתך עד שה־chunk הבא משלים אותו
  let buffer = "";
  let lineNo = 0;
  function pushLine(this: Transform, line: string): Error | null {
    lineNo++;
    if (line.trim() === "") return null;
    try {
      this.push(JSON.parse(line));
      return null;
    } catch {
      return new Error(`שורה ${lineNo}: JSON לא תקין`);
    }
  }
  return new Transform({
    readableObjectMode: true,
    transform(chunk: Buffer, _enc, cb: TransformCallback) {
      buffer += decoder.write(chunk);
      const lines = buffer.split("\n");
      buffer = lines.pop()!; // השורה האחרונה אולי עוד לא הסתיימה
      for (const l of lines) {
        const err = pushLine.call(this, l.replace(/\r$/, ""));
        if (err) return cb(err);
      }
      cb();
    },
    flush(cb: TransformCallback) {
      buffer += decoder.end();
      cb(pushLine.call(this, buffer.replace(/\r$/, "")) ?? undefined); // שורה אחרונה בלי \n
    },
  });
}
