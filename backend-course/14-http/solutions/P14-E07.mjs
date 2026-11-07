// P14-E07
const CATEGORIES = { 2: "success", 3: "redirect", 4: "client-error", 5: "server-error" };
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

export function statusCategory(code) {
  if (!Number.isInteger(code)) return "unknown";
  return CATEGORIES[Math.floor(code / 100)] ?? "unknown";
}

export function shouldRetry(code) {
  return RETRYABLE.has(code);
}

console.log([200, 204, 301, 404, 429, 503, 99].map(statusCategory).join(" "));
console.log([400, 404, 429, 500, 503].map(shouldRetry).join(" "));
