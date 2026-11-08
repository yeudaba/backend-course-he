// P28-E08
// שני אלגוריתמים של load balancer: round robin (בתורות) ו־least connections (למי שהכי פנוי)
export function roundRobin(servers: readonly string[]) {
  if (servers.length === 0) throw new Error("אין שרתים");
  let next = 0;
  return () => servers[next++ % servers.length];
}

export function leastConnections(servers: readonly string[]) {
  if (servers.length === 0) throw new Error("אין שרתים");
  const active = new Map(servers.map((s) => [s, 0]));
  return {
    // בתיקו — הראשון ברשימה (סדר קבוע)
    acquire(): string {
      let best = servers[0];
      for (const s of servers) if (active.get(s)! < active.get(best)!) best = s;
      active.set(best, active.get(best)! + 1);
      return best;
    },
    release(server: string) {
      const n = active.get(server);
      if (n === undefined) throw new Error(`שרת לא מוכר: ${server}`);
      if (n > 0) active.set(server, n - 1);
    },
    active: (server: string) => active.get(server) ?? 0,
  };
}
