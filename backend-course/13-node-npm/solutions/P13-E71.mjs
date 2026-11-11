// P13-E71: הסתרת סודות בכל עומק
const SENSITIVE = /password|secret|token|key/i;

export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE.test(k) ? "***" : redact(v)]));
  }
  if (typeof value === "string") return value.replace(/(\w+:\/\/[^:\/\s]+:)[^@\/\s]+@/g, "$1***@");
  return value;
}

const config = {
  port: 3000,
  db: { url: "postgres://dana:Sup3r@localhost:5432/shop", password: "Sup3r" },
  jwtSecret: "abc",
  apiKeys: { stripe: "sk_1" },
  admins: [{ email: "a@x.com", resetToken: "t1" }],
};
console.log(JSON.stringify(redact(config)));
console.log(config.db.password);
