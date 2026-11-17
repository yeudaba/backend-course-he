// P28-E51: round robin עם משקלים (smooth weighted, כמו nginx)
export function weightedRoundRobin(servers: { name: string; weight: number }[]) {
  if (servers.length === 0) throw new Error("אין שרתים");
  for (const s of servers) {
    if (!Number.isInteger(s.weight) || s.weight <= 0) throw new Error(`משקל לא תקין ל־${s.name}: ${s.weight}`);
  }
  const total = servers.reduce((sum, s) => sum + s.weight, 0);
  const current = servers.map(() => 0);
  return () => {
    let best = 0;
    for (let i = 0; i < servers.length; i++) {
      current[i] += servers[i].weight;
      if (current[i] > current[best]) best = i;
    }
    current[best] -= total;
    return servers[best].name;
  };
}
