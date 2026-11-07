// P13-E18
import fs from "node:fs";
import readline from "node:readline";

export async function countStatuses(file) {
  const result = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, invalid: 0, slowest: null };
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const raw of rl) {
    const line = raw.trim();
    if (line === "") continue;
    const parts = line.split(/\s+/);
    const status = Number(parts[2]);
    const ms = Number(parts[3]);
    const group = `${Math.floor(status / 100)}xx`;
    if (parts.length !== 4 || !Number.isInteger(status) || Number.isNaN(ms) || !(group in result) || group === "invalid") {
      result.invalid++;
      continue;
    }
    result[group]++;
    if (result.slowest === null || ms > result.slowest.ms) {
      result.slowest = { path: parts[1], ms };
    }
  }
  return result;
}

const os = await import("node:os");
const path = await import("node:path");
const file = path.join(os.tmpdir(), "demo-access.log");
fs.writeFileSync(file, "GET /a 200 12\nGET /b 404 3\n\nPOST /c 500 900\nbroken line\nGET /d 301 5\n");
console.log(await countStatuses(file));
