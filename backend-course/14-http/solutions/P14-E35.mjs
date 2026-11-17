// P14-E35: אותו origin?
export function sameOrigin(a, b) {
  let x, y;
  try {
    x = new URL(a);
    y = new URL(b);
  } catch {
    return false;
  }
  return x.protocol === y.protocol && x.hostname === y.hostname && x.port === y.port;
}

const pairs = [
  ["http://localhost:3000/a", "http://localhost:3000/b?x=1"],
  ["http://example.com", "http://example.com:80/x"],
  ["https://EXAMPLE.com/", "https://example.com:443"],
  ["https://example.com", "http://example.com"],
  ["http://localhost:3000", "http://127.0.0.1:3000"],
  ["http://localhost:3000", "http://localhost:3001"],
  ["not a url", "http://x.com"],
];
for (const [a, b] of pairs) console.log(sameOrigin(a, b), a, b);
