// P26.3-E93: לקרוא דוח JUnit
const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const attr = (attrs: string, name: string) => decode(new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1] ?? "");

export function junitSummary(xml: string) {
  const r = { tests: 0, failures: 0, errors: 0, skipped: 0, failed: [] as string[] };
  for (const m of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)) {
    const [, attrs, body = ""] = m;
    r.tests++;
    const failure = /<failure\b/.test(body);
    const error = /<error\b/.test(body);
    if (failure) r.failures++;
    if (error) r.errors++;
    if (/<skipped\b/.test(body)) r.skipped++;
    if (failure || error) r.failed.push(`${attr(attrs, "classname")} › ${attr(attrs, "name")}`);
  }
  return r;
}
