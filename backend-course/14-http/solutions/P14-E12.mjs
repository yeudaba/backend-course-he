// P14-E12
export async function getJson(url, { timeoutMs = 3000 } = {}) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
