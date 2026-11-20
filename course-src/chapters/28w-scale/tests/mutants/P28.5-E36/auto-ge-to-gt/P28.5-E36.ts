// P28.5-E36: דוח SLO ו־burn rate
export function sloReport(requests: { ms: number; status: number }[], slo: { latencyMs: number; target: number }) {
  const total = requests.length;
  if (total === 0) return { total: 0, good: 0, ratio: 1, burnRate: 0, ok: true };
  const good = requests.filter((r) => r.status < 500 && r.ms <= slo.latencyMs).length;
  const ratio = good / total;
  return {
    total,
    good,
    ratio: Math.round(ratio * 10_000) / 10_000,
    burnRate: Math.round(((1 - ratio) / (1 - slo.target)) * 10) / 10,
    ok: ratio > slo.target,
  };
}
