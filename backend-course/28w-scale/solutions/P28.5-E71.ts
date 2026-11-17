// P28.5-E71: gzip בזרם, ובחזרה
import fs, { createReadStream, createWriteStream } from "node:fs";
import { createGzip, createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";

export async function gzipFile(src: string, dst: string) {
  try {
    await pipeline(createReadStream(src), createGzip(), createWriteStream(dst));
  } catch (err) {
    await fs.promises.rm(dst, { force: true });
    throw err;
  }
  const [a, b] = await Promise.all([fs.promises.stat(src), fs.promises.stat(dst)]);
  return { inBytes: a.size, outBytes: b.size };
}

export async function countLinesGz(file: string): Promise<number> {
  let n = 0;
  const rl = createInterface({ input: createReadStream(file).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) if (line.trim()) n++;
  return n;
}
