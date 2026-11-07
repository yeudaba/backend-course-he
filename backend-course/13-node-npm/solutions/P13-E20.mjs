// P13-E20: מתוקן
import fs from "node:fs/promises";
import path from "node:path";

export async function loadPrices() {
  const text = await fs.readFile(path.join(import.meta.dirname, "P13-E20-prices.json"), "utf8");
  return JSON.parse(text);
}
