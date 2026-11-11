// P21-E27: פירוק header של Authorization
export type Credentials =
  | { scheme: "bearer"; token: string }
  | { scheme: "basic"; username: string; password: string };

export function parseAuthorization(header: string | undefined): Credentials | null {
  const match = header?.trim().match(/^(\S+)\s+(\S+)$/);
  if (!match) return null;
  const [, scheme, value] = match;

  switch (scheme.toLowerCase()) {
    case "bearer":
      return /^[A-Za-z0-9._~+/-]+=*$/.test(value) ? { scheme: "bearer", token: value } : null;
    case "basic": {
      const decoded = Buffer.from(value, "base64").toString("utf8");
      const i = decoded.indexOf(":");
      if (i <= 0) return null;
      return { scheme: "basic", username: decoded.slice(0, i), password: decoded.slice(i + 1) };
    }
    default:
      return null;
  }
}

console.log(parseAuthorization("Bearer eyJhbGciOi.eyJzdWIiOjd9.c2ln"));
console.log(parseAuthorization("basic " + Buffer.from("dana:pa:ss").toString("base64")));
console.log(parseAuthorization("Token abc"), parseAuthorization(undefined), parseAuthorization("Bearer"));
