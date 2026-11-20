// P28-E34: בתים בשפה של בני אדם
const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatBytes(bytes: number): string {

  let value = bytes;
  let i = 0;
  while (value >= 1000 && i < UNITS.length - 1) {
    value /= 1000;
    i++;
  }
  return `${Math.round(value * 10) / 10}${UNITS[i]}`;
}
