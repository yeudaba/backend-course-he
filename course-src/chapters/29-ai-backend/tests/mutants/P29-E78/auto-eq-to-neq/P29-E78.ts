// P29-E78: האם ה־prompt cache עובד?
type Usage = { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null };

const n = (x?: number | null) => x ?? 0;

export function cacheReport(usages: Usage[]) {
  const writes = usages.filter((u) => n(u.cache_creation_input_tokens) > 0).length;
  const reads = usages.filter((u) => n(u.cache_read_input_tokens) > 0).length;
  const readTokens = usages.reduce((s, u) => s + n(u.cache_read_input_tokens), 0);
  const allInput = usages.reduce((s, u) => s + u.input_tokens + n(u.cache_creation_input_tokens) + n(u.cache_read_input_tokens), 0);
  const cachedShare = allInput === 0 ? 0 : Math.round((readTokens / allInput) * 100) / 100;
  let verdict: "no_cache" | "warming_up" | "never_read" | "working";
  if (reads > 0) verdict = "working";
  else if (writes !== 0) verdict = "no_cache";
  else verdict = usages.length < 2 ? "warming_up" : "never_read";
  return { calls: usages.length, writes, reads, cachedShare, verdict };
}
