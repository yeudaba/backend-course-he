// P14-E72: להסתיר סודות בפקודת curl
const SECRET_PARAMS = new Set(["token", "key", "apikey", "password", "secret"]);

function redactHeader(header) {
  const colon = header.indexOf(":");
  if (colon === -1) return header;
  const name = header.slice(0, colon);
  const value = header.slice(colon + 1).trim();
  switch (name.trim().toLowerCase()) {
    case "authorization": {
      const space = value.indexOf(" ");
      return `${name}: ${space === -1 ? "***" : value.slice(0, space) + " ***"}`;
    }
    case "cookie":
      return `${name}: ${value
        .split(";")
        .filter((pair) => pair.trim() !== "")
        .map((pair) => pair.trim().split("=")[0] + "=***")
        .join("; ")}`;
    default:
      return header;
  }
}

function redactUrl(text) {
  const u = new URL(text);
  for (const key of [...u.searchParams.keys()]) {
    if (SECRET_PARAMS.has(key.toLowerCase())) u.searchParams.set(key, "***");
  }
  return u.href;
}

export function redactCurl(args) {
  return args.map((arg, i) => {
    if (args[i - 1] === "-H" || args[i - 1] === "--header") return redactHeader(arg);
    if (arg.startsWith("http://") || arg.startsWith("https://")) return redactUrl(arg);
    return arg;
  });
}

console.log(
  redactCurl([
    "https://api.shop.test/orders?page=2&API_KEY=abc123&token=xyz",
    "-H",
    "Authorization: Bearer eyJhbGciOi.secret",
    "-H",
    "cookie: sid=8f3a; theme=dark",
    "-H",
    "Accept: application/json",
  ]),
);
