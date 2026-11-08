// בדיקת עשן אחרי deploy (פרק 25): מחכה שהגרסה החדשה באמת רצה בכתובת החיה, ושהיא מוכנה.
// שימוש: BASE_URL=https://tasks-api-xyz.onrender.com EXPECT_COMMIT=<sha> node scripts/smoke.mjs
// ב־Render החינמי: build של כמה דקות, ושרת שישן מתעורר בערך דקה — לכן מחכים עד TIMEOUT_SECONDS.
const base = process.env.BASE_URL?.replace(/\/$/, "");
const expect = process.env.EXPECT_COMMIT;
const timeoutMs = Number(process.env.TIMEOUT_SECONDS ?? 900) * 1000;
const intervalMs = Number(process.env.INTERVAL_SECONDS ?? 10) * 1000;
if (!base) {
  console.error("חסר BASE_URL");
  process.exit(2);
}

async function get(path) {
  try {
    const res = await fetch(base + path, { signal: AbortSignal.timeout(15_000), redirect: "manual" });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, body: null, error: err.cause?.code ?? err.name };
  }
}

const started = Date.now();
for (let attempt = 1; Date.now() - started < timeoutMs; attempt++) {
  const v = await get("/version");
  const commit = v.body?.commit;
  if (v.status === 200 && (!expect || commit === expect)) {
    const ready = await get("/ready");
    if (ready.status === 200) {
      console.log(`✔ ${base} — commit ${commit.slice(0, 7)}, ready (${Math.round((Date.now() - started) / 1000)}s)`);
      process.exit(0);
    }
    console.log(`#${attempt}: הגרסה החדשה רצה, אבל /ready ← ${ready.status}`);
  } else {
    console.log(`#${attempt}: /version ← ${v.status || v.error}${commit ? `, commit ${commit.slice(0, 7)} (מחכים ל־${expect?.slice(0, 7)})` : ""}`);
  }
  await new Promise((r) => setTimeout(r, intervalMs));
}
console.error(`✖ הגרסה ${expect?.slice(0, 7) ?? ""} לא עלתה תוך ${timeoutMs / 1000} שניות`);
process.exit(1);
