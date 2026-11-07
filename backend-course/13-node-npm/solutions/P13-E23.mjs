// P13-E23: מתוקן
import fs from "node:fs";
import readline from "node:readline";

export async function countMatchingLines(file, word) {
  const w = word.toLowerCase();
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    if (line.toLowerCase().includes(w)) {
      count++;
    }
  }
  return count;
}

const os = await import("node:os");
const path = await import("node:path");
const file = path.join(os.tmpdir(), "count-demo.txt");
fs.writeFileSync(file, "Error A\nok\nERROR b\n");
console.log(await countMatchingLines(file, "error"));
