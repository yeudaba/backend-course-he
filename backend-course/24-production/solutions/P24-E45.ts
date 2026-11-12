// P24-E45: URL בלי סודות
const DEFAULT_SECRETS = ["token", "password", "code", "key", "secret"];

export function safeUrl(url: string, secretParams: string[] = DEFAULT_SECRETS): string {
  const secret = new Set(secretParams.map((s) => s.toLowerCase()));
  const u = new URL(url, "http://x"); // בסיס מדומה — originalUrl הוא נתיב יחסי
  for (const [k] of [...u.searchParams]) {
    if (secret.has(k.toLowerCase())) u.searchParams.set(k, "***");
  }
  const query = u.searchParams.toString();
  return query ? `${u.pathname}?${query}` : u.pathname;
}

console.log(safeUrl("/reset-password?token=8f3kQ1x&lang=he"));
console.log(safeUrl("/tasks?page=2&API_KEY=abc#top", ["api_key"]));
console.log(safeUrl("/search?q=a b"), safeUrl("/health"));
