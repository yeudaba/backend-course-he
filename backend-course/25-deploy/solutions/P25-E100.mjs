// P25-E100: healthcheck.mjs ל־Docker
const port = process.env.PORT || 3000;
try {
  const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(2000) });
  await res.body?.cancel();
  if (res.status !== 200) {
    console.error(`health ← ${res.status}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`health ← ${err.cause?.code ?? err.name}`);
  process.exit(1);
}
