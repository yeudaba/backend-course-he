// P29.5-E76: כמה עולה ההקשר שגדל
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

export function contextCost(addedPerStep: number[], opts: { systemTokens: number; usdPerMTokIn: number; usdPerMTokCacheRead: number }) {
  let sent = opts.systemTokens;
  let total = 0;
  let withCache = 0;
  addedPerStep.forEach((added, i) => {
    const previous = sent;
    sent += added;
    total += sent;
    withCache += i === 0 ? sent * opts.usdPerMTokIn : previous * opts.usdPerMTokCacheRead + added * opts.usdPerMTokIn;
  });
  return {
    totalInputTokens: total,
    usdNoCache: r6((total * opts.usdPerMTokIn) / 1e6),
    usdWithCache: r6(withCache / 1e6),
  };
}
