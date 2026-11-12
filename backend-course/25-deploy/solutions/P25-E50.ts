// P25-E50: pgConnectionOptions לכל sslmode
const VERIFY: Record<string, boolean> = { require: true, "verify-ca": true, "verify-full": true, "no-verify": false };

export function pgConnectionOptions(url: string): { connectionString: string; ssl?: { rejectUnauthorized: boolean } } {
  if (!url) return { connectionString: url };
  const u = new URL(url);
  const mode = u.searchParams.get("sslmode");
  u.searchParams.delete("sslmode");
  u.searchParams.delete("channel_binding");
  const connectionString = u.toString();
  if (!mode || mode === "disable") return { connectionString };
  if (!Object.hasOwn(VERIFY, mode)) throw new Error(`sslmode לא מוכר: ${mode}`);
  return { connectionString, ssl: { rejectUnauthorized: VERIFY[mode] } };
}
