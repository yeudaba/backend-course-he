// P28-E65: לנרמל URL לפני hash
export function normalizeUrl(raw: string): string {
  const url = new URL(raw.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`פרוטוקול לא נתמך: ${url.protocol}`);
  url.hash = "";
  const pairs: [string, string][] = [];
  for (const [name, value] of url.searchParams) {
    if (name.startsWith("utm_") || name === "fbclid") continue;
    pairs.push([name, value]);
  }
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  url.search = new URLSearchParams(pairs).toString();
  return url.href;
}
