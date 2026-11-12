// P25-E82: לעקוב אחרי הפניות
export async function redirectChain(fetchFn: typeof fetch, url: string, max = 5) {
  const chain: { url: string; status: number }[] = [];
  const seen = new Set<string>();
  let current = new URL(url).toString();
  for (;;) {
    if (seen.has(current)) throw new Error("REDIRECT_LOOP");
    seen.add(current);
    const res = await fetchFn(current, { redirect: "manual" });
    await res.body?.cancel();
    chain.push({ url: current, status: res.status });
    const location = res.headers.get("location");
    if (res.status < 300 || res.status > 399 || !location) return chain;
    if (chain.length > max) throw new Error("TOO_MANY_REDIRECTS");
    current = new URL(location, current).toString();
  }
}
