// P24-E31 — דוח latency מלוגים של JSON
export type RouteStats = { route: string; count: number; errorPct: number; p95: number };

export function routeOf(method: string, path: string): string {
  const clean = path.split("?")[0].replace(/\/\d+(?=\/|$)/g, "/:id");
  return `${method.toUpperCase()} ${clean}`;
}

function p95(sorted: number[]): number {
  return sorted[Math.ceil(sorted.length * 0.95) - 1];
}

export function routeReport(lines: string[]): { routes: RouteStats[]; skipped: number } {
  const byRoute = new Map<string, { ms: number[]; errors: number }>();
  let skipped = 0;
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      skipped++;
      continue;
    }
    if (entry?.msg !== "request" || typeof entry.ms !== "number") {
      skipped++;
      continue;
    }
    const route = routeOf(entry.method, entry.path);
    const stats = byRoute.get(route) ?? { ms: [], errors: 0 };
    stats.ms.push(entry.ms);
    if (entry.status >= 500) stats.errors++;
    byRoute.set(route, stats);
  }

  const routes = [...byRoute].map(([route, { ms, errors }]) => ({
    route,
    count: ms.length,
    errorPct: Math.round((errors / ms.length) * 1000) / 10,
    p95: p95([...ms].sort((a, b) => a - b)),
  }));
  routes.sort((a, b) => b.p95 - a.p95 || a.route.localeCompare(b.route));
  return { routes, skipped };
}

const lines = [
  '{"level":"info","msg":"server started","port":3000}',
  '{"level":"info","msg":"request","method":"GET","path":"/tasks","status":200,"ms":12}',
  '{"level":"info","msg":"request","method":"GET","path":"/tasks/17","status":200,"ms":8}',
  '{"level":"info","msg":"request","method":"GET","path":"/tasks/4?fields=title","status":404,"ms":5}',
  '{"level":"error","msg":"request","method":"POST","path":"/tasks","status":500,"ms":340}',
  '{"level":"info","msg":"request","method":"post","path":"/tasks","status":201,"ms":45}',
  "Error: connect ECONNREFUSED 127.0.0.1:5432",
  '{"level":"info","msg":"request","method":"GET","path":"/tasks/17/comments","status":200,"ms":30}',
];
const { routes, skipped } = routeReport(lines);
console.table(routes);
console.log("skipped:", skipped);
