// P13-E20: עובד רק כשמריצים מתוך starter. תקן.
import fs from "node:fs/promises";

export async function loadPrices() {
  const text = await fs.readFile("P13-E20-prices.json", "utf8");
  return JSON.parse(text);
}
