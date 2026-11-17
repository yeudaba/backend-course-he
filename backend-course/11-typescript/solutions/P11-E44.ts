// P11-E44: קבלה מיושרת
export function receipt(names: string[], prices: number[]): string {
  if (names.length !== prices.length) throw new Error("names ו־prices באורך שונה");
  const line = (label: string, n: number): string => label.padEnd(12) + n.toFixed(2).padStart(8);
  const lines: string[] = [];
  let total = 0;
  for (let i = 0; i < names.length; i++) {
    lines.push(line(names[i], prices[i]));
    total += prices[i];
  }
  lines.push(line("סה״כ", total));
  return lines.join("\n");
}

console.log(receipt(["קפה", "עוגה"], [12, 18.5]));
