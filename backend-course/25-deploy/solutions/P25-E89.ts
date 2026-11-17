// P25-E89: הפרמטרים של smoke.mjs
function positiveInt(env: Record<string, string | undefined>, name: string, fallback: number): number {
  const v = env[name];
  if (v === undefined || v === "") return fallback;
  if (!/^\d+$/.test(v) || Number(v) <= 0) throw new Error(`${name} לא תקין`);
  return Number(v);
}

export function parseSmokeEnv(env: Record<string, string | undefined>) {
  const raw = env.BASE_URL;
  if (!raw) throw new Error("חסר BASE_URL");
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("BASE_URL לא תקין");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("BASE_URL לא תקין");
  const baseUrl = raw.replace(/\/+$/, "");
  const commit = env.EXPECT_COMMIT || null;
  if (commit !== null && !/^[0-9a-f]{7,40}$/.test(commit)) throw new Error("EXPECT_COMMIT לא תקין");
  const timeoutSeconds = positiveInt(env, "TIMEOUT_SECONDS", 900);
  const intervalSeconds = positiveInt(env, "INTERVAL_SECONDS", 10);
  if (intervalSeconds > timeoutSeconds) throw new Error("INTERVAL_SECONDS גדול מ־TIMEOUT_SECONDS");
  return { baseUrl, expectCommit: commit, timeoutSeconds, intervalSeconds };
}
