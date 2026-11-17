// P13-E65: config מקונן וקפוא לגמרי
export function deepFreeze(obj) {
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) deepFreeze(value);
  }
  return Object.freeze(obj);
}

export function buildConfig(env) {
  const problems = [];
  const text = (name) => env[name]?.trim() ?? "";
  const int = (name, fallback, min, max) => {
    const raw = text(name);
    if (raw === "") return fallback;
    const n = Number(raw);
    if (!/^\d+$/.test(raw) || n < min || n > max) {
      problems.push(name);
      return fallback;
    }
    return n;
  };

  const port = int("PORT", 3000, 1, 65535);
  const hostRaw = env.HOST;
  if (hostRaw !== undefined && hostRaw.trim() === "") problems.push("HOST");
  const host = hostRaw?.trim() || "0.0.0.0";
  const url = text("DATABASE_URL");
  if (url === "") problems.push("DATABASE_URL");
  const poolSize = int("DB_POOL_SIZE", 10, 1, 100);
  const admins = text("ADMIN_EMAILS").split(",").map((s) => s.trim().toLowerCase()).filter((s) => s !== "");

  if (problems.length > 0) throw new Error(`הגדרות לא תקינות: ${problems.join(", ")}`);
  return deepFreeze({ server: { port, host }, db: { url, poolSize }, admins });
}

const config = buildConfig({ DATABASE_URL: "postgres://localhost/shop", ADMIN_EMAILS: "Dana@x.com, ,omer@x.com" });
console.log(config, Object.isFrozen(config.db), Object.isFrozen(config.admins));
try {
  buildConfig({ PORT: "99999", DB_POOL_SIZE: "abc" });
} catch (err) {
  console.log(err.message);
}
