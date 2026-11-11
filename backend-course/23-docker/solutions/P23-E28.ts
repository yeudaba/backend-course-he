// P23-E28 — גדלים של images
const UNITS = ["B", "kB", "MB", "GB", "TB"];

export function parseSize(text: string): number {
  const match = text.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (!match) throw new Error(`גודל לא תקין: ${text}`);
  const value = Number(match[1]);
  switch (match[2]) {
    case "B":
      return value;
    case "kB":
    case "KB":
      return value * 1000;
    case "MB":
      return value * 1000 ** 2;
    case "GB":
      return value * 1000 ** 3;
    case "TB":
      return value * 1000 ** 4;
    default:
      throw new Error(`יחידה לא מוכרת: ${match[2]}`);
  }
}

export function formatSize(bytes: number): string {
  let unit = 0;
  let value = bytes;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit++;
  }
  const text = unit === 0 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, "");
  return text + UNITS[unit];
}

export function totalSize(dockerImages: string): string {
  const [header, ...rows] = dockerImages.trim().split("\n");
  const sizeColumn = header.split(/\s{2,}/).indexOf("SIZE");
  if (sizeColumn === -1) throw new Error("אין עמודה SIZE");
  const bytes = rows
    .filter((row) => row.trim() !== "")
    .reduce((sum, row) => sum + parseSize(row.trim().split(/\s{2,}/)[sizeColumn]), 0);
  return formatSize(bytes);
}

console.log(parseSize("245MB"), parseSize("1.5GB"), parseSize("12.3kB"));
console.log(formatSize(245_000_000), formatSize(1_500_000_000), formatSize(999), formatSize(12_340));
console.log(
  totalSize(`REPOSITORY   TAG         IMAGE ID       CREATED        SIZE
tasks-api    latest      3f1c2a9b8e7d   2 hours ago    245MB
postgres     17-alpine   9a8b7c6d5e4f   3 weeks ago    278MB
node         24-slim     1a2b3c4d5e6f   4 weeks ago    1.21GB`),
);
