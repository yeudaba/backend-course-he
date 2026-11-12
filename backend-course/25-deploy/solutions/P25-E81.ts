// P25-E81: ביקורת על headers של תשובה
export function auditHeaders(headers: Record<string, string>, { https }: { https: boolean }): string[] {
  const h = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
  const findings: string[] = [];
  if (h["x-content-type-options"]?.toLowerCase() !== "nosniff") findings.push("missing-nosniff");
  const xfo = /^(deny|sameorigin)$/i.test(h["x-frame-options"] ?? "");
  const csp = /frame-ancestors/i.test(h["content-security-policy"] ?? "");
  if (!xfo && !csp) findings.push("missing-frame-protection");
  if ("x-powered-by" in h) findings.push("x-powered-by");
  const hsts = h["strict-transport-security"];
  if (https && !hsts) findings.push("hsts-missing");
  if (!https && hsts) findings.push("hsts-on-http");
  if (hsts) {
    const m = /max-age=(\d+)/i.exec(hsts);
    if (!m || Number(m[1]) < 15_552_000) findings.push("hsts-too-short");
  }
  return findings;
}
